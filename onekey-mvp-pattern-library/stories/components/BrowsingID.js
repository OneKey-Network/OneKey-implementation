import { RefreshIcon } from './Icons';
import Tooltip from './Tooltip';

export const BrowsingIDWrapper = (props) => `
  <div class="ok-ui-browsing-id-wrapper">
    <span>
      <span class="ok-ui-browsing-id-label" aria-describedby="ok-ui-your-browsing-id-tooltip">
        Your browsing ID
      </span>
      
      ${Tooltip({ id: 'ok-ui-your-browsing-id-tooltip', message: '<strong>OneKey</strong> links your preferences to a random, pseudonymous ID  that lasts 6 months. Use your right to be forgotten at any time by refreshing your browsing ID' })}
    </span>

    ${props.children || '<!-- BrowsingID component here !>'}
  </div>
`;

export default (args) => {
  const loading = args.loading || false;

  return `<button class="ok-ui-browsing-id${loading ? ' ok-ui-browsing-id--loading' : ''}">
    <span>${args.id}</span>

    ${RefreshIcon()}
  </button>`;
};