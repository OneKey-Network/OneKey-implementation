import Logo from './Logo';
import Button from './Button';
import Navigation, { NavigationState } from './Navigation';
import { Cross } from './Icons';

export const CardHeader = (props = {}) => `
  ${NavigationState()}

  <header class="ok-ui-card__header">
    ${props.children || `
      <div class="ok-ui-card__header-context">
        ${Logo()}

        <ul class="ok-ui-card__header-logos">
          <li>moneta</li>
          <li>Reach</li>
        </ul>

        <div class="ok-ui-card__header-close">
          ${Button({ style: 'text', icon: Cross(), iconOnly: true })}
        </div>
      </div>
      <nav class="ok-ui-card__header-navigation">
        <h1 class="ok-ui-heading-1">Advert audit</h1>

        ${Navigation()}
      </nav>
    `}
  </header>
`;

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