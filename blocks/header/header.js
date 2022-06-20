import {
  readBlockConfig,
  decorateIcons,
  makeLinksRelative,
  fetchPlaceholders,
  loadBlock,
  decorateBlock,
} from '../../scripts/helix-web-library.esm.js';
import {
  searchProducts,
  getCategories,
  setSelectedAccount,
  getSelectedAccount,
  checkCategoriesInCatalog,
} from '../../scripts/scripts.js';

async function updateTopBar() {
  const account = sessionStorage.getItem('account') ? JSON.parse(sessionStorage.getItem('account')) : '';
  const nav = document.querySelector('nav');
  const authNavi = nav.children[1].children[1];
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
      li.innerHTML = `<a href="/ca/en/products/category/${child.url_path.split('.')[0]}">${child.name}</a>${child.level === 2 ? '<span><img class="disclosureArrow" src="/icons/disclosure-white.svg"></span>' : ''}`;
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

    const classes = ['topbar', 'brand', 'sections', 'search', 'tools'];
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
    const languageSwitcher = document.createElement('div');
    languageSwitcher.classList.add('language-switcher');

    // TODO: Embedding the svg for now just so I can change the color..
    // This is shared with the facets filter so can't change in the svg file.
    // Embedding svg using the img tag kills the ability to change the color via css.
    languageSwitcher.innerHTML = /* html */`
    <span>English</span>
    <img class='canada-flag' src='/icons/canada-flag.svg' width="11" height="12"/>
    <svg xmlns="http://www.w3.org/2000/svg" width="237.201" height="348.328" viewBox="0 0 237.201 348.328"  fill="currentColor">
      <g transform="matrix(0.995, -0.105, 0.105, 0.995, -258.757, -67.721)" fill="currentColor">
        <path id="Path_4" data-name="Path 4" fill="currentColor" stroke="currentColor" d="M271.09,444.41,451.98,296.28l-23.062-28.164-.051.043L303.507,115.6l-28.125,23.1,125.33,152.51-152.68,125.03Z"/>
      </g>
    </svg>
    `;
    topbar.prepend(languageSwitcher);

    const search = nav.querySelector('.nav-search');
    const suggestions = document.createElement('div');
    suggestions.className = 'nav-search-suggestions';
    search.prepend(suggestions);
    const input = document.createElement('input');
    input.id = 'nav-search-input';
    input.setAttribute('list', 'nav-search-suggestion');
    input.setAttribute('placeholder', ph.searchPlaceholder);
    search.prepend(input);

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

    const fillSuggestions = async () => {
      suggestions.textContent = '';
      const query = input.value;
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
        option.className = r.hidden ? 'light' : '';
        option.innerHTML = `<a href="${r.href}">${addHighlight(r.title, query)}</a>`;
        suggestions.append(option);
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

    fillSuggestions();
    input.addEventListener('input', fillSuggestions);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        window.location.href = `/ca/en/search?query=${input.value}`;
      }
    });
    input.addEventListener('focus', () => {
      setTimeout(() => suggestions.classList.add('visible'), 300);
    });

    input.addEventListener('blur', () => {
      setTimeout(() => suggestions.classList.remove('visible'), 300);
    });

    // hamburger for mobile
    const hamburger = document.createElement('div');
    hamburger.classList.add('nav-hamburger');
    hamburger.innerHTML = '<div class="nav-hamburger-icon"></div>';
    hamburger.addEventListener('click', () => {
      const expanded = nav.getAttribute('aria-expanded') === 'true';
      document.body.style.overflowY = expanded ? '' : 'hidden';
      nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });
    nav.prepend(hamburger);
    nav.setAttribute('aria-expanded', 'false');
    decorateIcons(nav);
    block.append(nav);

    const products = nav.querySelector('.nav-sections > ul:first-of-type > li:first-of-type');
    products.addEventListener('click', (e) => {
      buildProductCategories(e);
    });
    const productsList = products.querySelector('ul');
    productsList.classList.add('nav-group');
    productsList.classList.add('level-2');
    productsList.innerHTML = '';

    const level1 = document.querySelector('nav .nav-sections > ul');
    level1.classList.add('level-1');
    const productsHeading = document.querySelector('nav .nav-sections > ul > li:first-of-type');
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
    filterCategoriesByAccount();

    /* init cart */
    const cartIcon = block.querySelector('.icon-cart');
    const cart = document.createElement('div');
    cartIcon.parentElement.append(cart);
    cart.append(cartIcon);
    cart.classList.add('cart');
    decorateBlock(cart);
    loadBlock(cart);
  }
}
