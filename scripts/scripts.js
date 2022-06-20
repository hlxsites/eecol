/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  HelixApp,
  buildBlock,
  getMetadata,
  fetchPlaceholders,
  loadHeader,
  decorateBlock,
  loadBlock,
  makeLinksRelative,
} from './helix-web-library.esm.js';

/**
 * Builds the hero autoblock
 * @param {HTMLElement} main
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * Builds an autoblock, the contents of which will be put into main
 * @param {HTMLElement} main
 */
function buildAutoBlock(main, blockName, replace = true, prepend = false) {
  const section = document.createElement('div');
  section.append(buildBlock(blockName, { elems: [] }));
  if (replace) {
    main.innerHTML = '';
    // If we are replacing the main content, we likely also want to add breadcrumbs
    section.prepend(buildBlock('breadcrumbs', { elems: [] }));
  }
  return prepend ? main.prepend(section) : main.append(section);
}

/**
 * Recursively build a dictionary of categories
 * @param {Object} category
 * @param {Object} categoriesKeyDictionary
 * @param {Object} categoriesIdDictionary
 * @param {Object} categoriesNameDictionary
 */
function buildCategoryDictionary(
  category,
  categoriesKeyDictionary,
  categoriesIdDictionary,
  categoriesNameDictionary,
) {
  const clone = { ...category };
  delete clone.children;
  categoriesKeyDictionary[category.url_key] = clone;
  categoriesIdDictionary[category.uid] = clone;
  categoriesNameDictionary[category.name] = clone;
  if (category.children) {
    category.children.forEach((child) => buildCategoryDictionary(
      child,
      categoriesKeyDictionary,
      categoriesIdDictionary,
      categoriesNameDictionary,
    ));
  }
}

/**
 * Captilies the first letter of every word in a string
 * @param {string} string
 * @returns {string} A string with the first letter of every word capitalized
 */
export function titleCase(string) {
  return string
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Fetches a hierarchy of categories from the server
 */
async function fetchCategories() {
  if (!window.categories) {
    const response = await fetch('https://graph.adobe.io/api/1c5364e3-f24b-4fda-b66e-af6a92be42cb/graphql?api_key=0986967bae3e492b9bcc2f9d81ade31a', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `{
  categories {
    total_count
    items {
      uid
      level
      url_key
      url_path
      name
      path
      children_count
      children {
        uid
        level
        name
        url_key
        url_path
        path
        children_count
        path_in_store
        children {
          uid
          level
          name
          path
          url_key
          url_path
        }
      }
    }
    page_info {
      current_page
      page_size
      total_pages
    }
  }
}`,
      }),
    });

    const json = await response.json();

    console.log(json);
    const categories = json.data.categories?.items[0].children;
    const categoriesKeyDictionary = {};
    const categoriesIdDictionary = {};
    const categoriesNameDictionary = {};
    categories.forEach((child) => buildCategoryDictionary(
      child,
      categoriesKeyDictionary,
      categoriesIdDictionary,
      categoriesNameDictionary,
    ));

    // Store categories in a hierarchy
    window.categories = categories;

    // Store categories in a dictionary
    window.categoriesKeyDictionary = categoriesKeyDictionary;
    window.categoriesIdDictionary = categoriesIdDictionary;
    window.categoriesNameDictionary = categoriesNameDictionary;
  }
}

/**
 * Returns fetched categories
 * @returns {Object}
 */
export async function getCategories() {
  if (!window.categories) {
    await fetchCategories();
  }

  return window.categories;
}

/**
 * Returns a dictionary of fetched categories
 * @returns {Object}
 */
export async function getCategoriesNameDictionary() {
  if (!window.categoriesNameDictionary) {
    await fetchCategories();
  }

  return window.categoriesNameDictionary;
}

/**
 * Returns a dictionary of fetched categories
 * @returns {Object}
 */
export async function getCategoriesKeyDictionary() {
  if (!window.categoriesKeyDictionary) {
    await fetchCategories();
  }

  return window.categoriesKeyDictionary;
}

/**
 * Returns a dictionary of fetched categories
 * @returns {Object}
 */
export async function getCategoriesIdDictionary() {
  if (!window.categoriesIdDictionary) {
    await fetchCategories();
  }

  return window.categoriesIdDictionary;
}

/**
 * Given a query string, return matching products
 * @param {string} query
 * @returns {Object}[]
 */
export async function searchProducts(query) {
  // TODO: Implement search
  return query;
}

function replaceProductImages(data) {
  return data.map((product) => {
    product.image = `${product.image.replace('https://qa-store.eecol.com/', 'https://main--eecol--hlxsites.hlx-orch.live/')}?format=webplyhttps://main--eecol--hlxsites.hlx-orch.live/media/catalog/product/cache/6d59eebca7373f2b9debabbeed105ddb/f/f/ff1a6bd51074f80f2873e6e068ed59dcf658b2cd-large.png?format=webply&quality=medium&width=750`;
    return product;
  });
}

/**
 * Returns an array of products for a category
 * @param {Object} category
 * @param {string} categoryFacets
 * @returns
 */
export async function lookupCategory(category, activeFilterUrlParams) {
  let products = [];
  const req = await fetch(`https://main--eecol--hlxsites.hlx-orch.live/productLookup?${category.uid ? `category=${category.uid}` : ''}${activeFilterUrlParams ? `&${activeFilterUrlParams}` : ''}`);
  if (req.status === 200) {
    products = await req.json();
    products.data = replaceProductImages(products.data);
  }
  return products;
}

/**
 * Returns an array of products for a category
 * @param {string} sku The product sku
 * @returns {import('../blocks/category/category.js').Product[]} An array of products
 */
export async function lookupProduct(sku) {
  let product = {};
  if (sku) {
    const req = await fetch(`https://main--eecol--hlxsites.hlx-orch.live/productLookup?sku=${sku}`);
    const json = await req.json();
    [product] = replaceProductImages(json.data);
  }
  return product;
}

/**
 * Fetches the inventory for a product
 * @param {string} customerId Customer Account Code
 * @param {string} productId Manufacturer part number
 * @param {string} productLine Manufacturer code from EECOL
 * @returns
 */
export async function lookupProductInventory(customerId, productId, productLine) {
  let inventoryData = {};
  if (customerId && productId && productLine) {
    const req = await fetch(`https://main--eecol--hlxsites.hlx-orch.live/inventory?customerId=${customerId}&productId=${productId}&productLine=${productLine}`);
    const json = await req.json();
    inventoryData = json.data;
  }
  return inventoryData;
}

/**
 * Fetches the pricing for a product
 * @param {string} customerId Customer Account Code
 * @param {string} productId Manufacturer part number
 * @param {string} productLine Manufacturer code from EECOL
 * @returns
 */
export async function lookupProductPricing(customerId, productId, productLine) {
  let inventoryData = {};
  if (customerId && productId && productLine) {
    const req = await fetch(`https://main--eecol--hlxsites.hlx-orch.live/pricing?customerId=${customerId}&productId=${productId}&productLine=${productLine}`);
    const json = await req.json();
    inventoryData = json.data;
  }
  return inventoryData;
}

/**
 * Return site placeholders
 * @returns {Object} Site placeholders
 */
export async function getPlaceholders() {
  if (!window.placeholders) {
    window.placeholders = await fetchPlaceholders('/ca/en');
  }
  return window.placeholders;
}

/**
 * Formats a price given a currency
 * @param {*} amount
 * @param {*} currency
 * @returns
 */
export function formatCurrency(amount, currency) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  });
  return (formatter.format(amount));
}

/**
 * Helper function to add a callback to multiple HTMLElements
 */
export function addEventListeners(elements, event, callback) {
  elements.forEach((e) => {
    e.addEventListener(event, callback);
  });
}

/**
 * Helper function guarentees the return of a number primitive
 * @param {string|number} value
 * @returns
 */
export const getNumber = (value) => +value;

/**
 * Adds a query param to the window location
 * @param {string} key
 * @param {string} value
 */
export function addQueryParam(key, value) {
  const sp = new URLSearchParams(window.location.search);
  sp.set(key, value);
  const path = `${window.location.pathname}?${sp.toString()}`;
  window.history.pushState(null, '', path);
}

/**
 * Removes a query param from the window location
 * @param {string} key
 * @param {string} value
 */
export function removeQueryParam(key) {
  const sp = new URLSearchParams(window.location.search);
  sp.delete(key);
  const paramsString = sp.toString();
  const path = (paramsString !== '') ? `${window.location.pathname}?${paramsString}` : window.location.pathname;
  window.history.pushState(null, '', path);
}

/**
 * Clears all query params from the window location
 * @param {string} key
 * @param {string} value
 */
export function clearQueryParams() {
  window.history.pushState(null, '', window.location.pathname);
}

const PageTypes = [
  'category',
  'product',
];

/**
 * check if products are available in catalog
 * @param {string[]} skus
 * @param {Object} account
 * @param {Object} hints
 */
export function checkProductsInCatalog(skus, account, hints) {
  const nameLookup = window.categoriesNameDictionary;
  if (account && account.config) {
    const allowedCategs = account.config.Categories.map((categ) => (nameLookup[categ] ? nameLookup[categ].uid : ''));

    return skus.map((sku, i) => {
      const hint = hints[i];
      return allowedCategs.some((categ) => hint.categories.includes(categ));
    });
  }
  return skus.map(() => true);
}

/**
 * check if categories are available in catalog
 * @param {string[]} categories
 * @param {Object} account
 * @returns {boolean[]} catergoy is in catalog
 */
export function checkCategoriesInCatalog(categories, account) {
  const allowedCategs = account.config.Categories;
  return categories.map((cat) => allowedCategs.includes(cat));
}

/**
 * Sets the currently set accountId in localstorage
 * @param {string} accountId
 */
export function setSelectedAccount(accountId) {
  localStorage.setItem('selectedAccount', accountId);
  const accountChange = new Event('account-change');
  document.body.dispatchEvent(accountChange);
}

/**
 * gets the currently set account via localstorage
 * @return {Object} selected account
 */
export function getSelectedAccount() {
  const account = sessionStorage.getItem('account') ? JSON.parse(sessionStorage.getItem('account')) : '';
  if (account && account.name) {
    const { accounts } = account;
    const selectedAccount = localStorage.getItem('selectedAccount');
    if (account.accountsById && !account.accountsById[selectedAccount]) {
      setSelectedAccount(accounts[0].accountId, accounts[0]);
      return (accounts[0]);
    }
    return account.accountsById[selectedAccount];
  }
  return undefined;
}

/**
 * Set key/value, scoped to selected account
 * @param {string} key
 * @param {Object|string|number|boolean} val
 */
export function storeUserData(key, val) {
  const id = localStorage.getItem('selectedAccount');
  if (!id) {
    console.warn('storeUserData() No account selected');
    return;
  }

  const scopedKey = `account/${id}/${key}`;
  localStorage.setItem(scopedKey, typeof val === 'object' ? JSON.stringify(val) : val);
}

/**
 * Get value for key, scoped to selected account
 * @param {string} key
 */
export function retrieveUserData(key) {
  const id = localStorage.getItem('selectedAccount');
  if (!id) {
    console.warn('retrieveUserData() No account selected');
    return;
  }

  const scopedKey = `account/${id}/${key}`;
  const data = localStorage.getItem(scopedKey);
  if (!data) {
    return;
  }

  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

/**
 * Fetch the logged in user
 * @returns {import('./auth.js').Authentication}
 */
export function getUserAccount() {
  return sessionStorage.getItem('account') ? JSON.parse(sessionStorage.getItem('account')) : undefined;
}

/**
 * Initiates the login process
 */
export function signIn() {
  const updateEvent = new Event('login');
  document.body.dispatchEvent(updateEvent);
}

/**
 * Application Store
 * @typedef {Object} Store
 */
export const store = {
  /**
   * @type {import('../blocks/category/category.js').Product}
   */
  product: undefined,

  /**
   * @type {import('../blocks/cart/cart.js').Cart}
   */
  cart: undefined,
};

/**
 *
 * Start the Helix Decoration Flow
 *
 */
HelixApp.init({
  lcpBlocks: ['hero', 'product'],
  rumGeneration: ['project-1'],
  productionDomains: ['poc-staging.eecol.com'],
  lazyStyles: true,
})
  .withLoadEager(async () => {
    await fetchCategories();
  })
  .withBuildAutoBlocks((main) => {
    try {
      const pageType = getMetadata('pagetype');
      if (PageTypes.includes(pageType)) {
        buildAutoBlock(main, pageType);
      } else {
        buildHeroBlock(main);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Auto Blocking failed', error);
    }
  })
  .withLoadHeader(async (header) => {
    loadHeader(header);
    const template = getMetadata('template');
    if (template === 'account') {
      const main = document.querySelector('main');
      const accountNav = buildBlock('account-nav', '');
      header.append(accountNav);
      decorateBlock(accountNav);
      await loadBlock(accountNav);
      main.parentElement.insertBefore(accountNav, main);
      makeLinksRelative(accountNav);
    }
  })
  .withLoadDelayed(() => {
    window.setTimeout(() => import('./delayed.js'), 4000);
  })
  .decorate();
