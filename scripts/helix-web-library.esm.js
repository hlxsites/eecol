/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 * @preserve
 */
/**
 * Returns a picture element with webp and fallbacks
 * @param {string} src The image URL
 * @param {boolean} eager load image eager
 * @param {Array} breakpoints breakpoints and corresponding params (eg. width)
 * @preserve Exclude from terser
 */
function e(e,t="",o=!1,n=[{media:"(min-width: 400px)",width:"2000"},{width:"750"}],a=[]){const i=new URL(e,window.location.href),c=document.createElement("picture");a.length>0&&c.classList.add(a);const{pathname:s}=i,r=s.substring(s.lastIndexOf(".")+1);return n.forEach((e=>{const t=document.createElement("source");e.media&&t.setAttribute("media",e.media),t.setAttribute("type","image/webp"),t.setAttribute("srcset",`${s}?width=${e.width}&format=webply&optimize=medium`),c.appendChild(t)})),n.forEach(((e,a)=>{if(a<n.length-1){const t=document.createElement("source");e.media&&t.setAttribute("media",e.media),t.setAttribute("srcset",`${s}?width=${e.width}&format=${r}&optimize=medium`),c.appendChild(t)}else{const n=document.createElement("img");n.setAttribute("src",`${s}?width=${e.width}&format=${r}&optimize=medium`),n.setAttribute("loading",o?"eager":"lazy"),n.setAttribute("alt",t),c.appendChild(n)}})),c}
/**
 * Given a set of breakpoints, returns the appropriate image URL for the most optimized version.
 * @param {string} src The image URL
 * @param {Array} breakpoints breakpoints and corresponding params (eg. width)
 * @preserve Exclude from terser
 */function t(e,t=[{media:"(min-width: 400px)",width:"2000"},{width:"750"}]){const o=new URL(e,window.location.href),{pathname:n}=o,a=n.substring(n.lastIndexOf(".")+1);return`${n}?width=${t[t.length-1].width}&format=${a}&optimize=medium`}
/**
 * Removes formatting from images.
 * @param {Element} main The container element
 * @preserve Exclude from terser
 */function o(e){[...e.querySelectorAll("strong picture"),...e.querySelectorAll("em picture")].forEach((e=>{const t=e.closest("p");t.prepend(e),t.lastChild.remove()}))}
/**
 * Retrieves the content of metadata tags.
 * @param {string} name The metadata name (or property)
 * @returns {string} The metadata value(s)
 * @preserve Exclude from terser
 */function n(e){const t=e&&e.includes(":")?"property":"name";return[...document.head.querySelectorAll(`meta[${t}="${e}"]`)].map((e=>e.content)).join(", ")||null}
/**
 * Decorates a block.
 * @param {Element} block The block element
 * @preserve Exclude from terser
 */function a(e){const t=e=>e.replace(/(^\s*-)|(-\s*$)/g,""),o=Array.from(e.classList.values())[0];if(!o)return;const n=e.closest(".section");n&&n.classList.add(`${o}-container`.replace(/--/g,"-"));const a=o.split("--"),i=t(a.shift()),c=a.map((e=>t(e)));e.classList.add(i),e.classList.add(...c),e.classList.add("block"),e.setAttribute("data-block-name",i),e.setAttribute("data-block-status","initialized");e.parentElement.classList.add(`${i}-wrapper`)}
/**
 * Decorates all blocks in a container element.
 * @param {Element} main The container element
 * @preserve Exclude from terser
 */function i(e){e.querySelectorAll("div.section > div > div").forEach((e=>a(e)))}
/**
 * Sanitizes a name for use as class name.
 * @param {string} name The unsanitized name
 * @returns {string} The class name
 * @preserve Exclude from terser
 */function c(e){return e&&"string"==typeof e?e.toLowerCase().replace(/[^0-9a-z]/gi,"-"):""}function s(e){return c(e).replace(/-([a-z])/g,(e=>e[1].toUpperCase()))}
/**
 * Extracts the config from a block.
 * @param {Element} block The block element
 * @returns {object} The block config
 * @preserve Exclude from terser
 */function r(e){const t={};return e.querySelectorAll(":scope>div").forEach((e=>{if(e.children){const o=[...e.children];if(o[1]){const n=o[1],a=c(o[0].textContent);let i="";if(n.querySelector("a")){const e=[...n.querySelectorAll("a")];i=1===e.length?e[0].href:e.map((e=>e.href))}else if(n.querySelector("img")){const e=[...n.querySelectorAll("img")];i=1===e.length?e[0].src:e.map((e=>e.src))}else if(n.querySelector("p")){const e=[...n.querySelectorAll("p")];i=1===e.length?e[0].textContent:e.map((e=>e.textContent))}else i=e.children[1].textContent;t[a]=i}}})),t}
/**
 * Decorates all sections in a container element.
 * @param {Element} main The container element
 * @preserve Exclude from terser
 */function l(e){e.querySelectorAll(":scope > div").forEach((e=>{const t=[];let o=!1;[...e.children].forEach((e=>{if("DIV"===e.tagName||!o){const n=document.createElement("div");t.push(n),o="DIV"!==e.tagName,o&&n.classList.add("default-content-wrapper")}t[t.length-1].append(e)})),t.forEach((t=>e.append(t))),e.classList.add("section"),e.setAttribute("data-section-status","initialized");const n=e.querySelector("div.section-metadata");if(n){const t=r(n);Object.keys(t).forEach((o=>{"style"===o?e.classList.add(c(t.style)):e.dataset[s(o)]=t[o]})),n.remove()}}))}
/**
 * Decorates the picture elements.
 * @param {Element} main The container element
 * @preserve Exclude from terser
 */function d(t){t.querySelectorAll('img[src*="/media_"').forEach(((t,o)=>{const n=e(t.src,t.alt,!o),a=t.closest("picture");if(a&&a.parentElement.replaceChild(n,a),["EM","STRONG"].includes(n.parentElement.tagName)){const e=n.parentElement;e.parentElement.replaceChild(n,e)}}))}
/**
 * Normalizes all headings within a container element.
 * @param {Element} elem The container element
 * @param {string[]} allowedHeadings The list of allowed headings (h1 ... h6)
 * @preserve Exclude from terser
 */function h(e,t){const o=t.map((e=>e.toLowerCase()));e.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((e=>{const t=e.tagName.toLowerCase();if(-1===o.indexOf(t)){let n=parseInt(t.charAt(1),10)-1;for(;-1===o.indexOf(`h${n}`)&&n>0;)n-=1;if(0===n)for(;-1===o.indexOf(`h${n}`)&&n<7;)n+=1;7!==n&&(e.outerHTML=`<h${n}>${e.textContent}</h${n}>`)}}))}
/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 * @preserve Exclude from terser
 */function u(e){const t=document.createElement("link");t.rel="icon",t.type=e.indexOf(".ico")?"image/x-icon":"image/svg+xml",t.href=e;const o=document.querySelector('head link[rel="icon"]');o?o.parentElement.replaceChild(t,o):document.getElementsByTagName("head")[0].appendChild(t)}
/**
 * Turns absolute links within the domain into relative links.
 * @param {Element} main The container element
 * @preserve Exclude from terser
 */function m(e,t=[]){e.querySelectorAll("a").forEach((e=>{const o=["hlx.page","hlx.live",...t];if(e.href)try{const t=new URL(e.href);o.some((e=>t.hostname.includes(e)))&&(e.href=`${t.pathname}${t.search}${t.hash}`)}catch(e){console.log(e)}}))}function f(){const e=n("template");e&&document.body.classList.add(e);const t=n("theme");t&&document.body.classList.add(t)}function w(e){!function(e){e.querySelectorAll("img.icon").forEach((e=>{const t=document.createElement("span");t.className=e.className,e.replaceWith(t)}))}(e),e.querySelectorAll("span.icon").forEach((e=>{const t=e.className.split("icon-")[1];fetch(`${window.hlx.codeBasePath}/icons/${t}.svg`).then((t=>{200===t.status&&t.text().then((t=>{e.innerHTML=t}))}))}))}function p(e){e.querySelectorAll("a").forEach((e=>{if(e.title=e.title||e.textContent,e.href!==e.textContent){const t=e.parentElement,o=e.parentElement.parentElement;e.querySelector("img")||(1!==t.childNodes.length||"P"!==t.tagName&&"DIV"!==t.tagName||(e.className="button primary",t.classList.add("button-container")),1===t.childNodes.length&&"STRONG"===t.tagName&&1===o.childNodes.length&&"P"===o.tagName&&(e.className="button primary",o.classList.add("button-container")),1===t.childNodes.length&&"EM"===t.tagName&&1===o.childNodes.length&&"P"===o.tagName&&(e.className="button secondary",o.classList.add("button-container")))}}))}
/**
 * loads a script by adding a script tag to the head.
 * @param {string} url URL of the js file
 * @param {Function} callback callback on load
 * @param {string} type type attribute of script tag
 * @returns {Element} script element
 * @preserve Exclude from terser
 */function y(e,t,o){const n=document.querySelector("head"),a=document.createElement("script");return a.setAttribute("src",e),o&&a.setAttribute("type",o),n.append(a),a.onload=t,a}
/**
 * Loads a CSS file.
 * @param {string} href The path to the CSS file
 * @preserve Exclude from terser
 */function g(e,t){if(document.querySelector(`head > link[href="${e}"]`))"function"==typeof t&&t("noop");else{const o=document.createElement("link");o.setAttribute("rel","stylesheet"),o.setAttribute("href",e),"function"==typeof t&&(o.onload=e=>t(e.type),o.onerror=e=>t(e.type)),document.head.appendChild(o)}}
/**
 * Updates all section status in a container element.
 * @param {Element} main The container element
 * @preserve Exclude from terser
 */function b(e){const t=[...e.querySelectorAll(":scope > div.section")];for(let e=0;e<t.length;e+=1){const o=t[e];if("loaded"!==o.getAttribute("data-section-status")){if(o.querySelector('.block[data-block-status="initialized"], .block[data-block-status="loading"]')){o.setAttribute("data-section-status","loading");break}o.setAttribute("data-section-status","loaded")}}}
/**
 * Loads JS and CSS for a block.
 * @param {Element} block The block element
 * @preserve Exclude from terser
 */async function E(e,t=!1){if("loading"!==e.getAttribute("data-block-status")&&"loaded"!==e.getAttribute("data-block-status")){e.setAttribute("data-block-status","loading");const o=e.getAttribute("data-block-name");if(o)try{const n=new Promise((e=>{g(`/blocks/${o}/${o}.css`,e)})),a=new Promise((n=>{(async()=>{try{const n=await import(`${window.hlx.codeBasePath}/blocks/${o}/${o}.js`);n.default&&await n.default(e,o,document,t)}catch(e){console.log(`failed to load module for ${o}`,e)}n()})()}));await Promise.all([n,a])}catch(e){console.log(`failed to load block ${o}`,e)}e.setAttribute("data-block-status","loaded")}}
/**
 * Loads JS and CSS for all blocks in a container element.
 * @param {Element} main The container element
 * @preserve Exclude from terser
 */async function k(e){b(e);const t=[...e.querySelectorAll("div.block")];for(let o=0;o<t.length;o+=1)await E(t[o]),b(e)}
/**
 * Builds a block DOM Element from a two dimensional array
 * @param {string} blockName name of the block
 * @param {any} content two dimensional array or string or object of content
 * @preserve Exclude from terser
 */function A(e,t){const o=Array.isArray(t)?t:[[t]],n=document.createElement("div");return n.classList.add(e),o.forEach((e=>{const t=document.createElement("div");e.forEach((e=>{const o=document.createElement("div");(e.elems?e.elems:[e]).forEach((e=>{e&&("string"==typeof e?o.innerHTML+=e:o.appendChild(e))})),t.appendChild(o)})),n.appendChild(t)})),n}
/**
 * Loads the header block.
 * @param {Element} header The header element
 * @preserve Exclude from terser
 */async function S(e,t){const o=A("header","");e.append(o),a(o),await E(o),m(o,t)}
/**
 * Loads the footer block.
 * @param {Element} footer The footer element
 * @preserve Exclude from terser
 */async function L(e,t){const o=A("footer","");e.append(o),a(o),await E(o),m(o,t)}
/**
 * load LCP block and/or wait for LCP in default content.
 * @preserve Exclude from terser
 */async function $(e,t){const o=e,n=document.querySelector(".block");n&&o.includes(n.getAttribute("data-block-name"))&&await E(n,!0),t&&document.querySelector("body").classList.add("appear");const a=document.querySelector("main img");await new Promise((e=>{a&&!a.complete?(a.setAttribute("loading","eager"),a.addEventListener("load",(()=>e())),a.addEventListener("error",(()=>e()))):e()}))}async function v(e="default"){window.placeholders=window.placeholders||{};return window.placeholders[`${e}-loaded`]||(window.placeholders[`${e}-loaded`]=new Promise(((t,o)=>{try{fetch(`${"default"===e?"":e}/placeholders.json`).then((e=>e.json())).then((o=>{const n={};o.data.forEach((e=>{n[s(e.Key)]=e.Text})),window.placeholders[e]=n,t()}))}catch(t){window.placeholders[e]={},o()}}))),await window.placeholders[`${e}-loaded`],window.placeholders[e]}
/**
 * log RUM if part of the sample.
 * @param {string} checkpoint identifies the checkpoint in funnel
 * @param {Object} data additional data for RUM sample
 * @preserve Exclude from terser
 */function x(e,t,o={}){try{if(window.hlx=window.hlx||{},!window.hlx.rum){const e="on"===new URLSearchParams(window.location.search).get("rum")?1:100,t=`${(e=>e.split("").reduce(((e,t)=>(e<<5)-e+t.charCodeAt(0)|0),0))(window.location.href)}-${(new Date).getTime()}-${Math.random().toString(16).substr(2,14)}`,o=Math.random(),n=o*e<1;window.hlx.rum={weight:e,id:t,random:o,isSelected:n}}const{random:n,weight:a,id:i}=window.hlx.rum;if(n&&n*a<1){const n=()=>{const n=JSON.stringify({weight:a,id:i,referer:window.location.href,generation:t,checkpoint:e,...o}),c=`https://rum.hlx.page/.rum/${a}`;navigator.sendBeacon(c,n)};if(n(),"cwv"===e){const e=document.createElement("script");e.src="https://rum.hlx.page/.rum/web-vitals/dist/web-vitals.iife.js",e.onload=()=>{const e=e=>{o.cwv={},o.cwv[e.name]=e.value,n()};window.webVitals.getCLS(e),window.webVitals.getFID(e),window.webVitals.getLCP(e)},document.head.appendChild(e)}}}catch(e){}}function q(e){window.name.includes("performance")&&console.log(`${new Date-performance.timing.navigationStart}:${e}`)}function C(){try{new PerformanceObserver((e=>{const t=e.getEntries();q(JSON.stringify(t)),console.log(t[0].element)})).observe({type:"largest-contentful-paint",buffered:!0});new PerformanceObserver((e=>{const t=e.getEntries();q(JSON.stringify(t)),console.log(t[0].sources[0].node)})).observe({type:"layout-shift",buffered:!0});new PerformanceObserver((e=>{e.getEntries().forEach((e=>{q(`resource loaded: ${e.name} - [${Math.round(e.startTime+e.duration)}]`)}))})).observe({type:"resource",buffered:!0})}catch(e){}}
/**
 * Initializes helix
 * @preserve Exclude from terser
 */function B(){window.hlx=window.hlx||{},window.hlx.lighthouse="on"===new URLSearchParams(window.location.search).get("lighthouse"),window.hlx.codeBasePath="";const e=document.querySelector('script[src$="/scripts/scripts.js"]');if(e)try{window.hlx.codeBasePath=new URL(e.src).href.replace("/scripts/scripts.js","")}catch(e){console.log(e)}}
/**
 * Adds one or more URLs to the dependencies for publishing.
 * @param {string|string[]} url The URL(s) to add as dependencies
 * @preserve Exclude from terser
 */function N(e){const t=Array.isArray(e)?e:[e];window.hlx=window.hlx||{},window.hlx.dependencies&&Array.isArray(window.hlx.dependencies)?window.hlx.dependencies.concat(t):window.hlx.dependencies=t}const P={makeLinksRelative:!0,lazyStyles:!1,autoAppear:!0,favIcon:"/styles/icon.svg"};class D{constructor(e=P){this.config=e,B(),this.config.rumEnabled&&(this.sampleRUM("top"),window.addEventListener("load",(()=>x("load"))),document.addEventListener("click",(()=>x("click")))),window.name.includes("performance")&&C()}static init(e){return new D(e)}withLoadEager(e){return this.loadEagerHook=e,this}withLoadLazy(e){return this.loadLazyHook=e,this}withLoadDelayed(e){return this.loadDelayed=e,this}withBuildAutoBlocks(e){return this.buildAutoBlocks=e,this}withLoadHeader(e){return this.loadHeader=e,this}withLoadFooter(e){return this.loadFooter=e,this}withDecorateSections(e){return this.decorateSections=e,this}withDecorateBlock(e){return this.decorateBlock=e,this}withDecorateIcons(e){return this.decorateIcons=e,this}withDecorateButtons(e){return this.decorateButtons=e,this}withPostDecorateBlockHook(e){return this.postDecorateBlockHook=e,this}async decorate(){await this.loadEager(document),await this.loadLazy(document),this.loadDelayed(document)}
/**
   * Decorates all blocks in a container element.
   * @param {Element} main The container element
   * @preserve Exclude from terser
   */decorateBlocks(e){e.querySelectorAll(this.config.blocksSelector??"div.section > div > div").forEach((e=>this.decorateBlock(e)))}decorateMain(e){d(e),o(e),(this.config.makeLinksRelative??P.makeLinksRelative)&&m(e,this.config.productionDomains),this.decorateButtons(e),this.decorateIcons(e),this.buildAutoBlocks(e),this.decorateSections(e),this.decorateBlocks(e),this.postDecorateBlockHook&&this.postDecorateBlockHook(e)}
/**
   * log RUM if part of the sample.
   * @param {string} checkpoint identifies the checkpoint in funnel
   * @param {Object} data additional data for RUM sample
   * @preserve Exclude from terser
   */sampleRUM(e,t={}){x(e,this.config.rumGeneration,t)}async loadEager(e){f();const t=e.querySelector("main");t&&(this.decorateMain(t),await this.waitForLCP(this.config.lcpBlocks??[])),this.loadEagerHook&&await this.loadEagerHook(e)}async loadLazy(e){const t=e.querySelector("main");await k(t);const{hash:o}=window.location;if(o)try{const e=t.querySelector(o);o&&e&&e.scrollIntoView()}catch{}this.loadHeader(e.querySelector("header")),this.loadFooter(e.querySelector("footer")),(this.config.lazyStyles??P.lazyStyles)&&g(`${window.hlx.codeBasePath}/styles/lazy-styles.css`),u(`${window.hlx.codeBasePath}${this.config.favIcon??P.favIcon}`),this.loadLazyHook&&this.loadLazyHook(e)}loadDelayed(){}buildAutoBlocks(){}async loadHeader(e){S(e,this.config.productionDomains)}async loadFooter(e){L(e,this.config.productionDomains)}
/**
   * Decorates all sections in a container element.
   * @param {Element} main The container element
   * @preserve Exclude from terser
   */decorateSections(e){l(e)}
/**
   * Decorates a block.
   * @param {Element} block The block element
   * @preserve Exclude from terser
   */decorateBlock(e){a(e)}
/**
   * Decorates all Icons.
   * @param {Element} block The block element
   * @preserve Exclude from terser
   */decorateIcons(e){w(e)}
/**
   * Decorates paragraphs containing a single link as buttons.
   * @param {Element} block The block element
   * @preserve Exclude from terser
   */decorateButtons(e){p(e)}
/**
   * load LCP block and/or wait for LCP in default content.
   * @preserve Exclude from terser
   */waitForLCP(e){return $(e,this.config.autoAppear??P.autoAppear)}}export{D as HelixApp,u as addFavIcon,N as addPublishDependencies,A as buildBlock,e as createOptimizedPicture,a as decorateBlock,i as decorateBlocks,p as decorateButtons,w as decorateIcons,d as decoratePictures,l as decorateSections,f as decorateTemplateAndTheme,v as fetchPlaceholders,n as getMetadata,t as getOptimizedImagePath,B as initHlx,E as loadBlock,k as loadBlocks,g as loadCSS,L as loadFooter,S as loadHeader,y as loadScript,m as makeLinksRelative,h as normalizeHeadings,r as readBlockConfig,C as registerPerformanceLogger,o as removeStylingFromImages,x as sampleRUM,q as stamp,s as toCamelCase,c as toClassName,b as updateSectionsStatus,$ as waitForLCP};
