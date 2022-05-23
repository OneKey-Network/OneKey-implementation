import Card, { CardHeader, CardBody } from '../components/Card';
import Button from '../components/Button';
import { Hide } from '../components/Icons';
import AdvertStatus from '../components/AdvertStatus';

export default {
  title: 'Groups/Advert'
};

export const Advert = () => Card({
  children: `
    ${CardHeader()}
    ${CardBody({
      children: `
      <div class="ok-ui-advert-wrapper">
        <div class="ok-ui-sm">
          <details class="ok-ui-advert">
            <summary class="ok-ui-meta ok-ui-mb-3">Show the advert image</summary>
            <img class="ok-ui-advert__image">
          </details>
        </div>

        <div class="ok-ui-lg">
          <img class="ok-ui-advert__image">
        </div>

        <div class="ok-ui-advert-details">
          <h1 class="ok-ui-heading-1">This ad is personalized for you</h1>
          <p class="ok-ui-meta ok-ui-mb-2">As you requested on 30-03-2022</p>

          <p class="ok-ui-lede">Thank you for supporting high value advertising and journalism 
          by choosing personalized ads. ❤️</p>

          <div class="ok-ui-mt-3 ok-ui-mb-3">
            ${AdvertStatus({ type: 'suspicious' })}
          </div>

          <h2 class="ok-ui-heading-2 ok-ui-mb-1">Pause this advert</h2>
          <p class="ok-ui-mb-2">If you don’t want to see this advert in the future you can pause it.</p>

          ${Button({ style: 'outlined', type: 'primary', label: 'Pause this ad', icon: Hide() })}
        </div>
      </div>
      `
    })}
  `
});

