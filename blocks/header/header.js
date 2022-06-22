import {
  readBlockConfig,
  decorateIcons,
  makeLinksRelative,
  fetchPlaceholders,
  loadBlock,
  decorateBlock,
  getMetadata,
  buildBlock,
} from '../../scripts/helix-web-library.esm.js';
import {
  searchProducts,
  getCategories,
  setSelectedAccount,
  getSelectedAccount,
  checkCategoriesInCatalog,
  addEventListeners,
  PageTypes,
} from '../../scripts/scripts.js';

async function updateTopBar() {
  const account = sessionStorage.getItem('account') ? JSON.parse(sessionStorage.getItem('account')) : '';
  const nav = document.querySelector('nav');

  const navWrapper = document.querySelector('.nav-topbar-wrapper');
  const authNavi = navWrapper.children[1];
  while (authNavi.firstChild) {
    authNavi.firstChild.remove();
  }

  if (account && account.name) {
    const { accounts } = account;
    if (accounts.length) {
      const selectedAccount = getSelectedAccount();
      const select = document.createElement('select');
      // select.classList.add('account-selector');
      accounts.forEach((acct) => {
        const option = document.createElement('option');
        option.value = acct.accountId;
        option.textContent = `Account: ${acct.accountName}`;
        if (acct.accountId === selectedAccount.accountId) option.setAttribute('selected', '');
        select.append(option);
      });
      select.addEventListener(('change'), () => {
        console.log('set select from header: ', select.value, account.accountsById[select.value]);
        setSelectedAccount(select.value, account.accountsById[select.value]);
      });
      authNavi.append(select);
    }

    authNavi.appendChild(document.createTextNode('Welcome '));
    const btnProfile = document.createElement('a');
    authNavi.appendChild(btnProfile);
    btnProfile.innerText = account.name;
    // btnProfile.href = '/profile.html';
    btnProfile.href = '/my-account/';

    authNavi.appendChild(document.createTextNode(' | '));

    const btnSignOut = document.createElement('a');
    authNavi.appendChild(btnSignOut);
    btnSignOut.innerText = 'Sign out';
    btnSignOut.style.cursor = 'pointer';
    btnSignOut.onclick = () => {
      const updateEvent = new Event('logout');
      document.body.dispatchEvent(updateEvent);
    };

    const accountBtn = nav.querySelector('.nav-toolbar-actions .account');
    accountBtn.addEventListener('click', () => {
      window.location = '/my-account/';
    });

    const accountBtnText = nav.querySelector('.nav-toolbar-actions .account .icon span');
    accountBtnText.textContent = 'Account';
  } else {
    const btnSignIn = document.createElement('a');
    authNavi.appendChild(btnSignIn);
    btnSignIn.innerText = 'Sign in';
    btnSignIn.onclick = () => {
      const updateEvent = new Event('login');
      document.body.dispatchEvent(updateEvent);
    };
    btnSignIn.style.cursor = 'pointer';
    authNavi.appendChild(document.createTextNode(' or '));
    const btnRegister = document.createElement('a');
    authNavi.appendChild(btnRegister);
    btnRegister.href = '/content/eecol/ca/en/register';
    btnRegister.innerText = 'Register';
    authNavi.appendChild(document.createTextNode(' CAD'));

    const accountBtn = nav.querySelector('.nav-toolbar-actions .account');
    accountBtn.addEventListener('click', () => {
      const updateEvent = new Event('login');
      document.body.dispatchEvent(updateEvent);
    });

    const accountBtnText = nav.querySelector('.nav-toolbar-actions .account .icon span');
    accountBtnText.textContent = 'Login';
  }
}

/**
 * collapses all open nav sections
 * @param {Element} sections The container element
 */

function collapseAllNavSections(sections) {
  sections.querySelectorAll('.nav-sections > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', 'false');
  });
}

function createCategory(title, children) {
  const ul = document.createElement('ul');

  const firstChild = children[0];
  if (firstChild) {
    ul.classList.add(`level-${firstChild.level}`);
  }
  ul.classList.add('nav-group');

  if (title) {
    const li = document.createElement('li');
    li.classList.add('nav-group-title');
    li.innerText = title;
    ul.appendChild(li);
  }

  children.forEach((child) => {
    if (child.url_path) {
      const li = document.createElement('li');
      li.innerHTML = `<a href="/ca/en/products/category/${child.url_path.split('.')[0]}">${child.name}</a>${child.level === 2 ? '<span><img class="disclosure-arrow" src="/icons/disclosure-white.svg"></span>' : ''}`;
      if (child.children) {
        li.append(createCategory(child.level !== 3 ? child.name : '', child.children));
      }
      ul.append(li);
    }
  });
  return (ul);
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  let categs;
  const cfg = readBlockConfig(block);
  block.textContent = '';

  const ph = await fetchPlaceholders('/ca/en');
  const categories = await getCategories();

  // fetch nav content
  const navPath = cfg.nav || '/nav';
  const resp = await fetch(`${navPath}.plain.html`);
  if (resp.ok) {
    const html = await resp.text();

    // decorate nav DOM
    const nav = document.createElement('nav');
    nav.innerHTML = html;
    decorateIcons(nav);
    makeLinksRelative(nav);

    const classes = ['topbar', 'toolbar', 'sections', 'search'];
    classes.forEach((e, j) => {
      const section = nav.children[j];
      if (section) section.classList.add(`nav-${e}`);
    });

    const navSections = [...nav.children][2];
    if (navSections) {
      navSections.querySelectorAll(':scope > ul > li').forEach((navSection) => {
        if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
        navSection.addEventListener('click', () => {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          collapseAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        });
      });
    }

    nav.querySelectorAll('.nav-tools .icon').forEach((icon) => {
      icon.closest('p').classList.add(`nav-tools-${icon.className.split('icon-')[1]}`);
    });

    const topbar = nav.querySelector('.nav-topbar');
    const topbarWrapper = document.createElement('div');
    topbarWrapper.classList.add('nav-topbar-wrapper');

    topbarWrapper.innerHTML = topbar.innerHTML;
    topbar.innerHTML = '';

    const languageSwitcher = document.createElement('div');
    languageSwitcher.classList.add('language-switcher');

    // TODO: Embedding the svg for now just so I can change the color..
    // This is shared with the facets filter so can't change in the svg file.
    // Embedding svg using the img tag kills the ability to change the color via css.
    languageSwitcher.innerHTML = /* html */`
    <span>EN</span>
    <img class='canada-flag' src='/icons/canada-flag.svg' width="11" height="12"/>
    <svg xmlns="http://www.w3.org/2000/svg" width="237.201" height="348.328" viewBox="0 0 237.201 348.328"  fill="currentColor">
      <g transform="matrix(0.995, -0.105, 0.105, 0.995, -258.757, -67.721)" fill="currentColor">
        <path id="Path_4" data-name="Path 4" fill="currentColor" stroke="currentColor" d="M271.09,444.41,451.98,296.28l-23.062-28.164-.051.043L303.507,115.6l-28.125,23.1,125.33,152.51-152.68,125.03Z"/>
      </g>
    </svg>
    `;
    topbarWrapper.prepend(languageSwitcher);

    topbar.append(topbarWrapper);

    nav.querySelector('.nav-toolbar').remove();

    const navToolbar = /* html */`
      <div class="nav-toolbar-logo">
        <picture>
          <source type="image/webp" srcset="./media_11e0e648e5f78452ada12404956dff13905bac140.png?width=2000&amp;format=webply&amp;optimize=medium" media="(min-width: 400px)">
          <source type="image/webp" srcset="./media_11e0e648e5f78452ada12404956dff13905bac140.png?width=750&amp;format=webply&amp;optimize=medium">
          <source type="image/png" srcset="./media_11e0e648e5f78452ada12404956dff13905bac140.png?width=2000&amp;format=png&amp;optimize=medium" media="(min-width: 400px)">
          <img loading="lazy" alt="Home" type="image/png" src="./media_11e0e648e5f78452ada12404956dff13905bac140.webp?width=139&amp;format=webp&amp;optimize=medium" width="139" height="45">
        </picture>
      </div>
      <div class="nav-search desktop">
        <input id="nav-search-input" list="nav-search-suggestion" placeholder="Search by keyword, item or part number">
        <p><a href="/search"><span class="icon icon-search"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M18.3 14.4C20.7 11.2 20.542 6.7 17.6 3.8C14.5 0.7 9.5 0.7 6.3 3.8C3.2 7 3.2 12.1 6.3 15.2C9.2 18.1 13.8 18.3 16.9 15.8C16.9 15.9 16.9 15.9 16.9 15.9L21.1 20.1C21.6 20.5 22.2 20.5 22.6 20.1C23 19.7412 22.9971 19.1081 22.6066 18.7175L18.364 14.4749C18.3493 14.4603 18.3343 14.4462 18.319 14.4326ZM16.2426 5.28251C18.5858 7.62565 18.5858 11.4246 16.2426 13.7678C13.8995 16.1109 10.1005 16.1109 7.75736 13.7678C5.41421 11.4246 5.41421 7.62565 7.75736 5.28251C10.1005 2.93936 13.8995 2.93936 16.2426 5.28251Z" fill="currentColor"></path>
        </svg></span></a></p>
      </div>
      <div class="nav-toolbar-actions">
        <div class="account">
          <div class="icon">
            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="user" class="svg-inline--fa fa-user cmp-AccountContainer__accountTrigger__icon" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"></path></svg>
            <span>Login</span>
          </div>
        </div>
        <div class="cart" data-block-name="cart" data-block-status="loaded">
          <div class="icon">
            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="shopping-cart" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M528.12 301.319l47.273-208C578.806 78.301 567.391 64 551.99 64H159.208l-9.166-44.81C147.758 8.021 137.93 0 126.529 0H24C10.745 0 0 10.745 0 24v16c0 13.255 10.745 24 24 24h69.883l70.248 343.435C147.325 417.1 136 435.222 136 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-15.674-6.447-29.835-16.824-40h209.647C430.447 426.165 424 440.326 424 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-22.172-12.888-41.332-31.579-50.405l5.517-24.276c3.413-15.018-8.002-29.319-23.403-29.319H218.117l-6.545-32h293.145c11.206 0 20.92-7.754 23.403-18.681z"></path></svg>
            <span class="cart-display">Cart</span>
          </div>
        </div>
        <div class="hamburger">
          <div class="icon">
            <svg class="svg-inline--fa fa-bars fa-w-14 mobile-header-button__icon" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="bars" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg="">
              <path fill="currentColor" d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"></path>
            </svg>
            <span>Menu</span>
          </div>
        </div>
      </div>`;

    const navToolbarContainer = document.createElement('div');
    navToolbarContainer.classList.add('nav-toolbar');
    navToolbarContainer.innerHTML = navToolbar;

    nav.append(navToolbarContainer);

    const searchMobile = nav.querySelector('.nav-search');
    const suggestions = document.createElement('div');
    suggestions.className = 'nav-search-suggestions';
    const mobileInput = document.createElement('input');
    mobileInput.id = 'nav-search-input';
    mobileInput.setAttribute('list', 'nav-search-suggestion');
    mobileInput.setAttribute('placeholder', ph.searchPlaceholder);
    searchMobile.prepend(mobileInput);

    const MAX_SUGGESTIONS = 10;

    const addHighlight = (text, highlight) => {
      if (highlight) {
        const offset = text.toLowerCase().indexOf(highlight.toLowerCase());
        if (offset >= 0) {
          return `${text.substr(0, offset)}<span class="highlight">${text.substr(offset, highlight.length)}</span>${text.substr(offset + highlight.length)}`;
        }
      }
      return text;
    };

    const filterNav = (query) => {
      const q = query.toLowerCase();
      const results = [...nav.querySelectorAll('a')].filter((e) => e.textContent.toLowerCase().includes(q)).slice(0, MAX_SUGGESTIONS);
      return results.map((e) => ({ title: e.textContent, href: e.href, hidden: !!e.closest('.hidden') }));
    };

    const fillSuggestions = async (input) => {
      const query = input.value;
      const parent = input.parentElement;
      const suggestionsContainer = parent.querySelector('.nav-search-suggestions');
      suggestionsContainer.textContent = '';
      const results = filterNav(query);
      if (results.length < MAX_SUGGESTIONS) {
        const products = await searchProducts({ fulltext: query });
        while (results.length < MAX_SUGGESTIONS && products.length) {
          const res = products.shift();
          results.push({ title: res.title, href: res.path });
        }
      }
      results.forEach((r) => {
        const option = document.createElement('div');
        option.innerHTML = `<a href="${r.href}">${addHighlight(r.title, query)}</a>`;
        suggestionsContainer.append(option);
      });
    };

    const filterCategoriesByAccount = () => {
      /* adjust navigation based on account information */
      const account = getSelectedAccount();
      if (account) {
        const topLevel = [...categs.querySelectorAll(':scope > li > a')];
        const show = checkCategoriesInCatalog(topLevel.map((a) => a.textContent), account);
        topLevel.forEach((a, i) => { a.closest('li').className = show[i] ? '' : 'hidden'; });
      }
    };

    const buildProductCategories = (e) => {
      const navGroup = e.target.querySelector('.nav-group li');
      if (navGroup) return;

      categs = createCategory('Categories', categories);
      const products = nav.querySelector('.nav-sections > ul:first-of-type > li:first-of-type > ul');
      products.replaceWith(categs);

      filterCategoriesByAccount();
    };

    const searchDesktop = nav.querySelector('.nav-search.desktop');
    const desktopInput = searchDesktop.querySelector('input');

    searchMobile.prepend(suggestions);
    searchDesktop.prepend(suggestions.cloneNode(true));

    addEventListeners([mobileInput, desktopInput], 'input', (e) => {
      fillSuggestions(e.target);
    });

    addEventListeners([mobileInput, desktopInput], 'focus', (e) => {
      const parent = e.target.parentElement;
      const suggestionsContainer = parent.querySelector('.nav-search-suggestions');
      setTimeout(() => suggestionsContainer.classList.add('visible'), 300);
    });

    addEventListeners([mobileInput, desktopInput], 'blur', (e) => {
      const parent = e.target.parentElement;
      const suggestionsContainer = parent.querySelector('.nav-search-suggestions');
      setTimeout(() => suggestionsContainer.classList.remove('visible'), 300);
    });

    addEventListeners([mobileInput, desktopInput], 'keypress', (e) => {
      if (e.key === 'Enter') {
        window.location.href = `/ca/en/search?query=${e.target.value}`;
      }
    });

    const logo = nav.querySelector('.nav-toolbar-logo');
    logo.addEventListener('click', () => {
      window.location = '/';
    });

    // hamburger for mobile
    const hamburger = navToolbarContainer.querySelector('.hamburger');
    hamburger.addEventListener('click', () => {
      const expanded = nav.getAttribute('aria-expanded') === 'true';
      // document.body.style.overflowY = expanded ? '' : 'hidden';
      nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });

    nav.setAttribute('aria-expanded', 'false');
    decorateIcons(nav);
    block.append(nav);

    const products = nav.querySelector('.nav-sections > ul:first-of-type > li:first-of-type');
    const productsCategoriesList = document.createElement('ul');
    productsCategoriesList.classList.add('nav-group');
    productsCategoriesList.classList.add('level-2');
    products.append(productsCategoriesList);
    products.addEventListener('click', (e) => {
      buildProductCategories(e);
    });

    const level1 = document.querySelector('nav .nav-sections > ul');
    level1.classList.add('level-1');

    // Add hamburger icon to Products section
    const productsHeading = document.querySelector('nav .nav-sections > ul > li:first-of-type');
    productsHeading.classList.add('nav-drop');

    const hamburgerIcon = document.createElement('div');
    hamburgerIcon.classList.add('nav-hamburger-icon');
    productsHeading.prepend(hamburgerIcon);

    const solutions = document.querySelector('header nav .nav-sections .level-1 .nav-drop:nth-child(2) ul');
    solutions.classList.add('level-2');
    solutions.classList.add('nav-group');

    document.body.addEventListener('account-change', () => {
      /* account switch */
      filterCategoriesByAccount();
    });

    document.body.addEventListener('login-update', () => {
      /* logged-in state changed, reflect in top bar */
      updateTopBar();
    });

    updateTopBar();

    /* init cart */
    const cartIcon = block.querySelector('header .nav-toolbar .nav-toolbar-actions .cart .icon');
    const cart = document.createElement('div');
    cartIcon.parentElement.append(cart);
    cart.append(cartIcon);
    cart.classList.add('cart');
    decorateBlock(cart);
    loadBlock(cart);

    const pageType = getMetadata('pagetype');
    if (PageTypes.includes(pageType)) {
      const section = document.createElement('div');
      document.querySelector('nav').append(section);
      const breadcrumbsBlock = buildBlock('breadcrumbs', '');
      section.append(breadcrumbsBlock);
      decorateBlock(breadcrumbsBlock);
      loadBlock(breadcrumbsBlock, false);
    }
  }
}
