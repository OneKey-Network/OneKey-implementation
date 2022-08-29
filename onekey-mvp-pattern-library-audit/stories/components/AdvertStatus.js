import Button from './Button';
import { Attention, Warning, ArrowRight, Check, External } from './Icons';

const content = {
  'loading': {
    title: 'Fetching the data&hellip;',
    body: 'Checking the companies involved in displaying this advert.'
  },
  'good': {
    title: 'No suspicious transactions found',
    body: 'With the advertisement that the publisher has displayed for you, everything is perfectly fine.',
    icon: Check(),
  },
  'suspicious': {
    title: 'Suspicious transaction detected',
    body: 'We detected one or more suspicous transaction in this advertisement\'s supply chain.',
    icon: Attention(),
    button: 'warning'
  },
  'violation': {
    title: 'Violation detected',
    body: 'We take your privacy seriously, we removed bad parties from our supply chain and we are reported to the authorites. If you want to take steps yourself this is what you can do:',
    icon: Warning(),
    button: 'danger'
  },
};

export default (args) => {
  const type = args.type || 'loading';
  const classes = ['ok-ui-advert-status', `ok-ui-advert-status--${type}`];

  return `
    <div class="${classes.join(' ')}">
      ${content[type].icon ? `
        <span class="ok-ui-icon--xl">${content[type].icon}</span>
      ` : ''}

      ${type === 'loading' ? `
        <span class="ok-ui-loading"></span>
      ` : ''}

      <h3 class="ok-ui-heading-3 ok-ui-mt-1 ok-ui-mb-1">${content[type].title}</h3>

      <p>${content[type].body}</p>

      ${type === 'loading' || type === 'good' ? '' : `
        <div class="ok-ui-advert-status__footer">
          ${Button({
            style: 'filled',
            type: content[type].button,
            label: 'Check companies',
            icon: ArrowRight(),
            iconPosition: 'end'
          })}

          <hr class="ok-ui-divide" />

          ${Button({ type: 'text', label: 'Learn more', icon: External(), iconPosition: 'end' })}
        </div>
      `}
    </div>
  `;
};