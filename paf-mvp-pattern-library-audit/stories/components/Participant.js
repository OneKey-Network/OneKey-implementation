import Button from './Button';
import { Check, Attention, Warning, ChevronDown, Trophy } from './Icons';

export const ParticipantParties = (args) => `
  <div class="ok-ui-participant-parties">
    ${args.children || ''}
  </div>
`;

const statuses = {
  trusted: {
    name: 'Trusted',
    icon: Check(),
  },
  suspicious: {
    name: 'Suspicious',
    icon: Attention(),
  },
  violation: {
    name: 'Violation detected',
    icon: Warning(),
  },
};

export default (args) => {
  const status = args.status || 'trusted';
  const loading = args.loading || false;
  const winning = args.winning || false;
  const show = args.parties && args.show || false;

  const classes = ['ok-ui-participant'];

  if (winning) {
    classes.push('ok-ui-participant--winning');
  }

  if (show || loading) {
    classes.push('ok-ui-participant--show-parties');
  }

  return `
    <article class="${classes.join(' ')}">
      <div class="ok-ui-participant__body">
        <div class="ok-ui-participant__status-wrapper">
          <div class="ok-ui-participant__status ok-ui-participant__status--${status}">${statuses[status].icon} <span>${statuses[status].name}</span></div>
        </div>
        <div class="ok-ui-participant__details">
          <h3 class="ok-ui-heading-3">Biscuit News</h3>
          <p class="ok-ui-meta">
            ${winning ? `${Trophy()} Bidding platform` : 'Site displays the ad'}
          </p>
        </div>
        <div class="ok-ui-participant__actions">
          ${Button({ style: 'outlined', type: 'primary', label: 'See Terms' })}
          ${Button({ style: 'outlined', type: 'danger', label: 'Report' })}
        </div>
      </div>
      ${args.parties ? `
        <div class="ok-ui-participant__footer">
          ${loading ? `
            <span class="ok-ui-loading-wrapper">
              <span class="ok-ui-loading ok-ui-loading--small"></span>

              Loading
            </span>
          ` : `
            <span>
              ${show ? 'Hide' : 'Show'} ${args.parties} contracting part${args.parties === 1 ? 'y' : 'ies'}
            </span>
          `}

          ${ChevronDown()}
        </div>
      ` : ''}
    </article>
  `;
};