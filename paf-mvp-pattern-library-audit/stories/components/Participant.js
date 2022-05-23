import Button from './Button';
import { Check, Attention, Warning, ChevronDown } from './Icons';

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

  return `
    <article class="ok-ui-participant">
      <div class="ok-ui-participant__body">
        <div class="ok-ui-participant__status-wrapper">
          <div class="ok-ui-participant__status ok-ui-participant__status--${status}">${statuses[status].icon} <span>${statuses[status].name}</span></div>
        </div>
        <div class="ok-ui-participant__details">
          <h3 class="ok-ui-heading-3">Biscuit News</h3>
          <p class="ok-ui-meta">Site displays the ad</p>
        </div>
        <div class="ok-ui-participant__actions">
          ${Button({ style: 'outlined', type: 'primary', label: 'See Terms' })}
          ${Button({ style: 'outlined', type: 'danger', label: 'Report' })}
        </div>
      </div>
      ${args.parties ? `
        <div class="ok-ui-participant__footer">
          <span>Show ${args.parties} contracting part${args.parties === 1 ? 'y' : 'ies'}</span>

          ${ChevronDown()}
        </div>
      ` : ''}
    </article>
  `;
};