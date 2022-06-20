import { ChevronDown } from '../components/Icons';

export default (args) => {
  const children = args.children || '';
  const label = args.label || '';
  const type = args.type || false;
  const classes = ['ok-ui-details'];

  if (type) {
    classes.push(`ok-ui-details--${type}`);
  }

  return `
    <details class="${classes.join(' ')}">
      <summary class="ok-ui-meta">
        ${label}

        <span class="ok-ui-details__icon">${ChevronDown()}</span>
      </summary>
      
      <div class="ok-ui-mt-1">
        ${children}
      </div>
    </details>
  `;
};