export default (args) => {
  let icon = '';

  const classes = ['ok-ui-button', `ok-ui-button--${args.style}`];

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
    icon = `<svg width="12" height="8" viewBox="0 0 12 8" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.22 3.33382L5.60667 0.940488L4.66667 0.000488281L0.666666 4.00049L4.66667 8.00049L5.60667 7.06049L3.22 4.66716H11.3333V3.33382H3.22Z"/>
    </svg>`;
  } else if (typeof args.icon === 'string') {
    icon = args.icon;
  }
  
  return `<button type="button" class="${classes.join(' ')}"${args.disabled ? ' disabled' : ''}>
    ${icon ? icon : ''}

    ${args.label ? `<span class="ok-ui-button__label">${args.label}</span>` : ''}
  </button>`;
};