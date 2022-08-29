import Details from './Details';
import { BlockedImage } from './Icons';

const Image = (args = {}) => {
  const width = args.width || '224';
  const height = args.height || '447';
  const imageSrc = `https://picsum.photos/${width}/${height}`;

  const children = `
    <div class="ok-ui-advert__image" style="--advert-image: url(${imageSrc})">
      ${args.children ? args.children : `<img src="${imageSrc}" alt="" />`}
    </div>
  `;

  return `
    <div class="ok-ui-advert__image-wrapper">
      ${children}
    </div>
  `;
};

export default (args) => {
  const classes = ['ok-ui-advert'];
  const paused = args.paused || false;

  if (paused) {
    classes.push('ok-ui-advert--paused');
  }

  const image = Image({ width: args.width, height: args.height });

  return `
    <div class="${classes.join(' ')}">
      <div class="ok-ui-sm">
        ${Details({ label: 'Show the advert image', children: image })}
      </div>

      <div class="ok-ui-lg">
        ${image}
      </div>
    </div>
  `;
};

export const BlockedAdvertImage = () => {
  return `
    <div class="ok-ui-advert ok-ui-advert--blocked">
      <div class="ok-ui-lg">
        ${Image({ children: `
          <span class="ok-ui-icon--lg">${BlockedImage()}</span>
          <p class="ok-ui-mt-1 ok-ui-mb-0.5">Advert is blocked</p>
          <p class="ok-ui-meta">We detected a privacy violation, so the advert was blocked to prevent the advertiser from earning money.</p>
        ` })}
      </div>
    </div>
  `;
};