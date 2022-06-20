import { readBlockConfig, decorateIcons } from '../../scripts/helix-web-library.esm.js';

function renderSocial(block) {
  const container = document.createElement('div');
  container.className = 'social-container';
  container.innerHTML = /* html */`
    <p>Follow Us!</p>
    <p>
      <a href="https://www.facebook.com/EecolElectric">
        <span class="icon icon-facebook">
          <img src="/icons/social-facebook.svg" width="24" height="24">
        </span>
      </a>
    </p>
    <p>
      <a href="https://twitter.com/EECOL">
        <span class="icon icon-twitter">
          <img src="/icons/social-twitter.svg" width="24" height="24">
        </span>
      </a>
    </p>
    <p>
      <a href="https://www.instagram.com/eecolsouthernalberta">
        <span class="icon icon-instagram">
          <img src="/icons/social-instagram.svg" width="24" height="24">
        </span>
      </a>
    </p>
    <p>
      <a href="https://ca.linkedin.com/company/eecol-electric">
        <img src="/icons/social-linkedin.svg" width="24" height="24">
      </a>
    </p>
  `;

  block.parentElement.prepend(container);
}

/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`);
  const html = await resp.text();
  const footer = document.createElement('div');
  footer.innerHTML = html;
  await decorateIcons(footer);
  block.append(footer);

  const copywrite = block.querySelector('.footer div div:nth-child(5)');
  copywrite.classList.add('terms-copywrite');
  block.append(copywrite);

  const footerSections = block.querySelectorAll('.footer div:nth-child(1) div');
  footerSections.forEach((section) => {
    const disclosure = document.createElement('img');
    disclosure.src = '/icons/plus.svg';
    disclosure.width = '20px';
    disclosure.height = '20px';
    section.classList.add('footer-section');
    section.setAttribute('aria-expanded', 'false');

    section.addEventListener('click', (event) => {
      const { currentTarget } = event;
      if (currentTarget.getAttribute('aria-expanded') === 'false') {
        currentTarget.querySelector('img').src = '/icons/minus.svg';
        currentTarget.querySelector('.footer-section-options').style.display = 'block';
        currentTarget.setAttribute('aria-expanded', 'true');
      } else {
        currentTarget.querySelector('img').src = '/icons/plus.svg';
        currentTarget.querySelector('.footer-section-options').style.display = 'none';
        currentTarget.setAttribute('aria-expanded', 'false');
      }
    });

    const heading = section.querySelector('h5');
    heading.append(disclosure);

    const optionsDiv = document.createElement('div');
    const options = section.querySelectorAll('p');
    options.forEach((option) => {
      optionsDiv.append(option);
    });
    optionsDiv.classList.add('footer-section-options');
    section.append(optionsDiv);
  });

  renderSocial(block);
}
