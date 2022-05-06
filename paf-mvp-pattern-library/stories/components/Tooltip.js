import { InfoIcon } from './Icons';

export default (props = { id: '', message: '' }) => `
  <button class="ok-ui-tooltip" tabindex="0">
    ${InfoIcon()}

    <span class="ok-ui-tooltip__message-wrapper">
      <span id="${props.id}" class="ok-ui-tooltip__message">${props.message}</span>
    </span>
  </button>
`;