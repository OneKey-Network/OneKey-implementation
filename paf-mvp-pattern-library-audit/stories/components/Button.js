import { ArrowRight } from "./Icons";

export default (args) => {
  let icon = '';

  const classes = ['ok-ui-button', `ok-ui-button--${args.style}`];

  if (args.type) {
    classes.push(`ok-ui-button--${args.type}`);
  }

  if (args.width) {
    classes.push(`ok-ui-button--${args.width}`);
  }

  if (args.size && args.size !== 'large') {
    classes.push(`ok-ui-button--${args.size}`);
  }

  if (args.iconOnly) {
    classes.push('ok-ui-button--icon-only');
  }

  if (args.iconPosition) {
    classes.push(`ok-ui-button--icon-${args.iconPosition}`);
  }

  if (typeof args.icon === 'boolean' && args.icon) {
    icon = ArrowRight();
  } else if (typeof args.icon === 'string') {
    icon = args.icon;
  }
  
  return `<button type="button" class="${classes.join(' ')}"${args.disabled ? ' disabled' : ''}>
    ${icon ? icon : ''}

    ${args.label ? `<span class="ok-ui-button__label">${args.label}</span>` : ''}
  </button>`;
};