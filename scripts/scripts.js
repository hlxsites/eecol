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
  HelixApp, buildBlock, getMetadata, fetchPlaceholders,
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
 * Builds the product page autoblock
 * @param {HTMLElement} main
 */
function buildProductBlock(main) {
  const section = document.createElement('div');
  section.append(buildBlock('product', { elems: [] }));
  main.innerHTML = '';
  main.append(section);
}

/**
 * Builds the category page autoblock
 * @param {HTMLElement} main
 */
function buildCategoryBlock(main) {
  const section = document.createElement('div');
  section.append(buildBlock('category', { elems: [] }));
  main.innerHTML = '';
  main.append(section);
}

/**
 * Recursively build a dictionary of categories
 * @param {Object} category
 * @param {Object} categoriesDictionary
 */
function buildCategoryDictionary(category, categoriesDictionary) {
  categoriesDictionary[category.url_key] = { ...category };
  delete categoriesDictionary[category.url_key].children;
  if (category.children) {
    category.children.forEach((child) => buildCategoryDictionary(child, categoriesDictionary));
  }
}

/**
 * Fetches a hierarchy of categories from the server
 */
async function fetchCategories() {
  if (!window.categories) {
    const response = await fetch('https://wesco.experience-adobe.com/categories');
    const json = await response.json();
    const categories = json.categories?.items[0].children;
    const categoriesDictionary = {};
    categories.forEach((child) => buildCategoryDictionary(child, categoriesDictionary));

    // Store categories in a hierarchy
    window.categories = categories;

    // Store categories in a dictionary
    window.categoriesDictionary = categoriesDictionary;
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
export async function getCategoriesDictionary() {
  if (!window.categoriesDictionary) {
    await fetchCategories();
  }

  return window.categoriesDictionary;
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

/**
 * Returns an array of products for a category
 * @param {*} category
 * @param {*} categoryFacets
 * @returns
 */
export async function lookupCategory(category, categoryFacets = {}) {
  let products = [];
  if (category) {
    const req = await fetch(`https://wesco.experience-adobe.com/productLookup?category=${category.uid}&facets=${Object.keys(categoryFacets).join(',')}`);
    const json = await req.json();
    products = json.data;
  }
  return products;
}

/**
 * Returns an array of products for a category
 * @param {*} category
 * @param {*} categoryFacets
 * @returns
 */
export async function lookupProduct(sku) {
  let product = {};
  if (sku) {
    const req = await fetch(`https://wesco.experience-adobe.com/productLookup?sku=${sku}`);
    const json = await req.json();
    product = json.data;
  }
  return product;
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
 *
 * Start the Helix Decoration Flow
 *
 */
HelixApp.init({
  lcpBlocks: ['hero'],
  rumGeneration: ['project-1'],
  productionDomains: ['poc-staging.eecol.com'],
})
  .withLoadEager(async () => {
    await fetchCategories();
  })
  .withBuildAutoBlocks((main) => {
    try {
      const pageType = getMetadata('pagetype');
      if (pageType === 'category') {
        buildCategoryBlock(main);
      } else if (pageType === 'product') {
        buildProductBlock(main);
      } else {
        buildHeroBlock(main);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Auto Blocking failed', error);
    }
  })
  .decorate();
