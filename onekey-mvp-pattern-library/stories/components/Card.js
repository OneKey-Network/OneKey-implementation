import Logo from './Logo';

export const CardHeader = (props = {}) => `<header class="ok-ui-card__header">
  ${props.children || 'Card header'}
</header>`;

export const CardHeaderLogo = (props = { center: false }) => {
  const center = props.center ? ' ok-ui-card__header-logo--center' : '';

  return Logo({ classes: 'ok-ui-card__header-logo' + center });
};

export const CardBody = (props = {}) => `<main class="ok-ui-card__body">
  ${props.children || 'Card body'}
</main>`;

export const CardFooter = (props = {}) => `<footer class="ok-ui-card__footer">
  ${props.children || 'Card footer'}
</footer>`;

export const CardActions = (props = {}) => `<div class="ok-ui-card__actions">
  ${props.children || 'Card actions'}
</div>`;

export default (props = {}) => `
  <section class="ok-ui-card">${props.children || `
    ${CardHeader()}
    ${CardBody()}
    ${CardFooter({ children: `Card footer
      ${CardActions()}`
    })}
  `}</section>
`;