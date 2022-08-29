import Tooltip from './Tooltip';

export const ToggleWrapper = (props = {}) => `<div class="ok-ui-toggle-wrapper">
  ${props.children || ''}
</div>`;

export default (args) => {
  const description = args.description;
  const name = args.name || 'only-this-site';
  const value = args.value || Date.now();
  const checked = args.checked || false;
  const disabled = args.disabled || false;
  const position = args.position || 'start';
  const emphasis = args.style === 'emphasis';
  const tooltip = args.tooltip || false;
  const link = args.link ? '<a href="#" class="ok-ui-link">View privacy policy</a>' : '';

  return `<div class="ok-ui-toggle ok-ui-toggle--input-${position}">
    <input class="ok-ui-toggle__input" type="checkbox" name="${name}" value="${value}" id="ok-ui-${name}-${value}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''} />

    <label class="ok-ui-toggle__input-facade" for="ok-ui-${name}-${value}"></label>
    
    <div class="ok-ui-toggle__content">
      <label class="ok-ui-toggle__label ${emphasis ? 'ok-ui-toggle__label--emphasis' : ''}" aria-described-by="ok-ui-${name}-${value}-tooltip" for="ok-ui-${name}-${value}">
        ${description}
      </label>

      ${link}

      ${tooltip ? Tooltip({ id: `ok-ui-${name}-${value}-tooltip`, message: description }) : ''}
    </div>
  </div>`;
};