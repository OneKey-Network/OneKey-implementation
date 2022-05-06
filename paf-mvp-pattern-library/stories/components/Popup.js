export default (args) => `
  <div class="ok-ui-popup${args.open ? ' ok-ui-popup--open' : ''}">
    <div class="ok-ui-popup__block"></div>
    <div class="ok-ui-popup__content">
      ${args.children || '<!-- put a Card element here -->'}
    </div>
  </div>
`;