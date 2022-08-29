import { LogoIcon } from './Logo';

export default (args) => {
  const width = args.width || '224';
  const height = args.height || '447';
  const imageSrc = `https://picsum.photos/${width}/${height}`;

  return `
    <article class="ok-ui-website-advert">
      <img src="${imageSrc}" alt="" />

      <footer class="ok-ui-website-advert__footer">
        <button class="ok-ui-website-advert__action">
          ${LogoIcon()}
        </button>
      </footer>
    </article>
  `;
};