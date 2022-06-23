import {
  getPlaceholders,
  lookupProduct,
  titleCase,
  lookupProductPricing,
  getUserAccount,
  signIn,
  store,
} from '../../scripts/scripts.js';

/**
 * Mulesoft Pricing Object
 * @typedef {Object} ProductPricing
 * @property {string} productId The product id, manufacturer_part_number_brand in CIF?
 * @property {string} productLine Manufacturer code from EECOL
 * @property {string} qty Available quantity
 * @property {string} sellprice The sellprice for the given uom
 * @property {string} uom Unit of measure, numeric value representing the pricing unit.
 * @property {string} branch Alphanumeric branch code
 * @property {string} blank Discounts???
 * @property {string} sellunit Alphanumeric field representing the selling unit of measure.
 * @property {string} numericuom Numeric value representing the selling unit of measure.
 * @property {string} basismeasurecode The stock status of the product
 * @property {string} description Customer friendly description of basismeasurecode
 * @property {boolean} instock Is the product instock
 */

class ProductView {
  constructor(block) {
    this.block = block;
  }

  async load() {
    const sku = window.location.pathname.split('/').pop();
    try {
      const product = await lookupProduct(sku);
      store.product = product;

      document.title = store.product.name;
      document.dispatchEvent(new CustomEvent('product-loaded'));

      this.ph = await getPlaceholders('/ca/en');
      this.render();
    } catch (error) {
      this.render404();
    }

    document.body.addEventListener('account-change', this.render.bind(this));
  }

  /**
   * Determines if the can add the product to the cart
   */
  enableAddToCart() {
    const addToButton = this.block.querySelector('.cart .action .add-to-cart');
    const notInCatalogLabel = this.block.querySelector('.cart .not-in-catalog');
    const quantityInput = this.block.querySelector('.cart .action input');
    if (quantityInput) {
      const quantity = parseInt(quantityInput.value, 2);
      if (store.cart
        && quantityInput
        && store.cart.canAdd(
          store.product.sku,
          store.product,
          store.product.pricing.sellprice * quantity,
          quantity,
        )
      ) {
        addToButton.disabled = false;
        quantityInput.disabled = false;
        notInCatalogLabel.classList.remove('visible');
        return;
      }
      addToButton.disabled = true;
      quantityInput.disabled = true;
      notInCatalogLabel.classList.add('visible');
    }
  }

  addToCart() {
    const quantityInput = this.block.querySelector('.cart .action input');
    const quantity = parseInt(quantityInput.value, 2);
    if (store.cart) {
      store.cart.add(
        store.product.sku,
        store.product,
        store.product.pricing.sellprice * quantity,
        quantity,
      );
    }
  }

  /**
   * Render a 404 if we were unable to load the product
   */
  render404() {
    this.block.innerHTML = /* html */`
      <div class="product-heading">
          <h1>Uh-oh.... we were unable to find this product</h1>
      </div>
    `;
  }

  /**
   * Render the core scaffold of the product page
   */
  renderProductScaffolding() {
    this.block.innerHTML = /* html */`
      <div class="product-block">
        <picture><img src="${store.product.image}"></picture>
        <div class="details">
          <div class="manufacturer">${titleCase(store.product.manufacturer)}</div>
          <div class="name"><h3>${store.product.name}</h3></div>
          <div class="catalog">
            <div>Manufacturer #: ${store.product.manufacturer_part_number_brand}</div>
            <div>SKU #: ${store.product.sku}</div>
            <div>Customer Part #: ${store.product.sku}</div>
          </div>
        </div>
      </div>
      <div class="product-config">
        <div class="cart"></div>
      </div>
    `;
  }

  /**
   * Render the product overview block
   */
  renderProductOverview() {
    const div = document.createElement('div');
    div.className = 'product-overview';
    div.innerHTML = /* html */`
        <h3>Product Overview</h3>
        <div class="description">${store.product.description}</div>
    `;
    this.block.appendChild(div);
  }

  /**
   * Render the loading animation while we are loading the pricing
   */
  renderPricingLoading() {
    const cartElement = this.block.querySelector('.product-config .cart');
    cartElement.innerHTML = /* html */`
      <div class="cart-loader">
        <div class="dot-flashing"></div>
      </div>`;
  }

  /**
   * Render the sign in block in place of pricing
   */
  renderPricingSignin() {
    const cartElement = this.block.querySelector('.product-config .cart');
    cartElement.innerHTML = /* html */`
      <a class="signin">Sign in for Price</a>
    `;
    cartElement.querySelector('a').addEventListener('click', () => {
      signIn();
    });
  }

  /**
   * Renders the add to cart block
   * @param {ProductPricing} pricing
   * @returns {string}
   */
  renderAddToCartBlock(pricing, currency) {
    return /* html */`
      <div class="not-in-catalog">Item not in catalog</div>
      <div class="cost">
        <div class="numericuom">${currency} ${pricing.sellprice}</div><span>/</span><div class="basismeasure">${pricing.description}</div>
      </div>
      <div class="stock">
        <div class="status">
          <img class="icon icon-search" src="${pricing.instock ? '/icons/circle-check.svg' : '/icons/circle-x.svg'}">
          <span>${pricing.instock ? 'In Stock' : 'Out of Stock'}<span>
        </div>
        <a>View Inventory</a>
      </div>
      ${pricing.instock ? /* html */`
        <div class="action">
          <input class="quantity" value="1"></input><button class='add-to-cart'>ADD TO CART</button>
        </div>
      ` : ''}
      <div class="requirements">
        <div class="minQuantity">Min. Qty: ${pricing.sellunit}</div><div class="increments">Increments of: ${pricing.sellunit}</div>
      </div>`;
  }

  /**
   * Renders the product block
   */
  render() {
    this.renderProductScaffolding();

    this.userAccount = getUserAccount();
    if (this.userAccount) {
      this.renderPricingLoading();
      lookupProductPricing('123', Math.random().toString(), 'abc').then((result) => {
        if (result.products && result.products.length > 0) {
          const [pricing] = result.products;
          pricing.instock = pricing.qty > 0;
          store.product.pricing = pricing;

          const productCartElement = this.block.querySelector('.product-config .cart');
          productCartElement.innerHTML = this.renderAddToCartBlock(pricing, result.currency);
          this.enableAddToCart();

          const addToCartBtn = this.block.querySelector('.cart .action .add-to-cart');
          addToCartBtn.addEventListener('click', () => {
            this.addToCart();
          });
        }
      });
    } else {
      this.renderPricingSignin();
    }

    if (store.product.description) {
      this.renderProductOverview();
    }
  }
}

export default async function decorateProduct(block) {
  const productView = new ProductView(block);
  await productView.load();
}
