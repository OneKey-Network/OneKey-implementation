export default (args) => {
  const title = args.title;
  const description = args.description;
  const name = args.name || 'marketing';
  const value = args.value || '1';
  const checked = args.checked || false;

  return `<div class="ok-ui-option">
    <input class="ok-ui-option__input" type="radio" name="${name}" value="${value}" id="ok-ui-${name}-${value}" ${checked ? 'checked' : ''} />
    <label class="ok-ui-option__label" for="ok-ui-${name}-${value}">
      <span class="ok-ui-option__input-facade"></span>
      <div class="ok-ui-option__content">
        <h3 class="ok-ui-heading-3">${title}</h3>
        <p>${description}</p>
      </div>
    </label>
  </div>`;
};