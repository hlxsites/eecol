import { getMetadata } from '../../scripts/helix-web-library.esm.js';
import { getCategoriesKeyDictionary, getCategoriesIdDictionary, store } from '../../scripts/scripts.js';

function renderBreadcrumbs(block, breadcrumbs) {
  breadcrumbs.unshift({
    name: 'Home',
    path: '/',
  });

  const breadCrumbsHTML = /* html */`
    <ul>
      ${breadcrumbs.map(({ name, path }) => /* html */`<li><a href="${path}">${name}</a></li>`).join('')}
    </ul > `;

  block.innerHTML = breadCrumbsHTML;

  if (breadcrumbs.length > 2) {
    block.classList.add('trim');
  }
}

/**
 * Decorates a categories page
 * @param {HTMLElement} block
 */
export default async function decorate(block) {
  const pageType = getMetadata('pagetype');
  const { pathname } = window.location;
  const pathsArray = pathname.split('/');

  const breadcrumbs = [];
  if (pageType === 'category') {
    const categories = await getCategoriesKeyDictionary();

    // pop current page
    let segment = pathsArray.pop();
    if (segment !== 'search') {
      while (segment !== 'category') {
        const { name, url_key: categoryUrlKey } = categories[segment];
        breadcrumbs.push({
          name,
          path: `${pathsArray.join('/')}/${categoryUrlKey}`,
        });
        segment = pathsArray.pop();
      }

      breadcrumbs.reverse();
    } else {
      breadcrumbs.push({
        name: 'Search',
        path: `${pathsArray.join('/')}/search`,
      });
    }
    renderBreadcrumbs(block, breadcrumbs);
  } else if (pageType === 'product') {
    const categoryIdDictionary = await getCategoriesIdDictionary();
    const {
      categories: productCategories,
      name: productName,
      url_key: productUrlKey,
    } = store.product;
    pathsArray.pop();
    pathsArray.push('category');
    productCategories.forEach((productCategoryId) => {
      const productCategory = categoryIdDictionary[productCategoryId];
      if (productCategory) {
        const { name: categoryName, url_key: categoryUrlKey } = productCategory;
        breadcrumbs.push({
          name: categoryName,
          path: `${pathsArray.join('/')}/${categoryUrlKey}`,
        });

        pathsArray.push(categoryUrlKey);
      }
    });

    breadcrumbs.push({
      name: productName,
      path: `${pathsArray.join('/')}/${productUrlKey}`,
    });

    renderBreadcrumbs(block, breadcrumbs);
  } else {
    block.querySelectorAll(':scope > div').forEach((row) => {
      const [name, path] = [...row.querySelectorAll(':scope > div')].map((n) => n.innerText);
      if (name && path) {
        breadcrumbs.push({
          name,
          path,
        });
      }
    });

    renderBreadcrumbs(block, breadcrumbs);
    const header = document.querySelector('body > header');
    const wrapper = block.parentElement;
    if (header) {
      wrapper.parentElement.classList.remove('breadcrumbs-container');
      wrapper.parentElement.removeChild(wrapper);
      header.insertAdjacentElement('afterend', wrapper);
    }
  }
}
