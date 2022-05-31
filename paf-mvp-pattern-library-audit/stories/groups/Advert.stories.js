import Card, { CardHeader, CardBody } from '../components/Card';
import Button from '../components/Button';
import Option from '../components/Option';
import { Hide, Show, Cross } from '../components/Icons';
import AdvertImage, { BlockedAdvertImage } from '../components/AdvertImage';
import AdvertStatus from '../components/AdvertStatus';

export default {
  title: 'Groups/Advert'
};

export const Advert = (args = {}) => Card({
  blocked: !!args.blocked,
  children: `
    ${CardHeader()}
    ${CardBody({
      children: `
      <div class="ok-ui-advert-wrapper">
        ${AdvertImage({
          paused: false,
          width: args.width,
          height: args.height
        })}

        <div class="ok-ui-advert-details">
          <h1 class="ok-ui-heading-1 ok-ui-mb-0.5">This ad is personalized for you</h1>
          <p class="ok-ui-meta ok-ui-mb-2">As you requested on 30-03-2022</p>

          <p class="ok-ui-lede">Thank you for supporting high value advertising and journalism 
          by choosing personalized ads. ❤️</p>

          <div class="ok-ui-mt-3 ok-ui-mb-4">
            ${AdvertStatus({ type: 'suspicious' })}
          </div>

          <h2 class="ok-ui-heading-2 ok-ui-mb-1">Pause this advert</h2>
          <p class="ok-ui-mb-2">If you don’t want to see this advert in the future you can pause it.</p>

          ${Button({ style: 'outlined', type: 'primary', label: 'Pause this ad', icon: Hide() })}
        </div>
      </div>
      `
    })}
    ${args.children || ''}
  `
});

export const SquareAdvert = () => Advert({ width: 600, height: 600 });

export const LeaderboardAdvert = () => Advert({ width: 728, height: 90 });

export const AdvertWithPopover = () => `
  ${Advert({
    blocked: true,
    children: `
      <div class="ok-ui-popover ok-ui-card">
        <div class="ok-ui-popover__header">
          ${Button({ style: 'text', icon: Cross(), iconOnly: true })}
        </div>

        <h1 class="ok-ui-heading-1 ok-ui-mb-2">You are about the pause Bubble’s ad</h1>

        <p>In mus ultricies sed venenatis nisi, adipiscing. Tortor lacinia et eros, tellus porta facilisi augue aenean.</p>
        
        <p class="ok-ui-heading-3 ok-ui-mt-4 ok-ui-mb-3">Help us with answering why you do not want to see this advertisement! (optional)</p>

        <form>
          ${Option({
            title: 'Not relevant for me',
            description: 'Get relevant content and ads on participating websites.'
          })}
          ${Option({
            title: 'It\'s disturbing',
            description: 'Get relevant content and ads on participating websites.',
            value: 2
          })}
          ${Option({
            title: 'Other option',
            description: 'Get relevant content and ads on participating websites.',
            value: 3
          })}

          <div class="ok-ui-button-group ok-ui-mt-3">
            ${Button({ style: 'filled', type: 'primary', label: 'Cancel' })}
            ${Button({ style: 'filled', type: 'primary', label: 'Pause ad', icon: Hide() })}
          </div>
        </form>
      </div>
    `
  })}
`;

export const PausedAdvert = (args = {}) => Card({
  blocked: !!args.blocked,
  children: `
    ${CardHeader()}
    ${CardBody({
      children: `
      <div class="ok-ui-advert-wrapper">
        ${AdvertImage({ paused: true })}

        <div class="ok-ui-advert-details">
          <h1 class="ok-ui-heading-1">This ad is personalized for you</h1>
          <p class="ok-ui-meta ok-ui-mb-2">As you requested on 30-03-2022</p>

          <p class="ok-ui-lede">Thank you for supporting high value advertising and journalism 
          by choosing personalized ads. ❤️</p>

          <div class="ok-ui-mt-3 ok-ui-mb-4">
            ${AdvertStatus({ type: 'suspicious' })}
          </div>

          <h2 class="ok-ui-heading-2 ok-ui-mb-1">Display this advert</h2>
          <p class="ok-ui-mb-2">Display this advert to see it again in the future.</p>

          ${Button({ style: 'outlined', type: 'primary', label: 'Display this ad', icon: Show() })}
        </div>
      </div>
      `
    })}
    ${args.children || ''}
  `
});

export const BlockedAdvert = (args = {}) => Card({
  blocked: !!args.blocked,
  children: `
    ${CardHeader()}
    ${CardBody({
      children: `
      <div class="ok-ui-advert-wrapper">
        ${BlockedAdvertImage()}

        <div class="ok-ui-advert-details">
          <h1 class="ok-ui-heading-1 ok-ui-mb-1">This ad was not displayed</h1>

          <p class="ok-ui-lede">We are keeping your data safe, and if we find any advert which violates them, we are not going to show it to you.</p>

          <div class="ok-ui-mt-3">
            ${AdvertStatus({ type: 'violation' })}
          </div>
        </div>
      </div>
      `
    })}
    ${args.children || ''}
  `
});