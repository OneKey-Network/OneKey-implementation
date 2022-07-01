import { Attention, Warning, Check } from './Icons';

const icons = {
  'good': Check(),
  'suspicious': Attention(),
  'violation': Warning()
};

const Status = (args) => {
  const type = args.type || 'good';
  
  if (!icons[type]) return '';
  
  const large = args.large;
  
  const classes = ['ok-ui-status', `ok-ui-status--${type}`];

  if (large) {
    classes.push('ok-ui-icon--xl');
  }

  return `
    <span class="${classes.join(' ')}">${icons[type]}</span>
  `;
};

export default Status;

export const StatusWrapper = ({ children, iconPosition, ...args }) => {
  const classes = ['ok-ui-status-wrapper'];

  if (iconPosition) {
    classes.push(`ok-ui-status-wrapper--icon-${iconPosition}`);
  }

  return `
    <span class="${classes.join(' ')}">
      ${Status(args)}
      <span>${children}</span>
    </span>
  `;
};