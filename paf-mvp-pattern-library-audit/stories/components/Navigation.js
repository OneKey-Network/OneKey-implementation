import { Folder, Users, Download, Loudhailer, ChevronDown } from './Icons';

export const NavigationState = () => `
  <input type="checkbox" id="ok-ui-navigation-toggle-state" class="ok-ui-navigation-toggle-state" />
`;

export default (args) => {
  const items = args.items || ['Advert', 'Your data', 'Participants', 'Download'];
  const selected = args.selected || 1;

  return `
    <div class="ok-ui-navigation-wrapper">
      <label for="ok-ui-navigation-toggle-state" class="ok-ui-navigation-toggle ok-ui-navigation__item ok-ui-navigation__item--selected">
        <span class="ok-ui-navigation__icon">
          ${Loudhailer()}
        </span>

        <span class="ok-ui-navigation__label">${items[0]}</span>

        <span class="ok-ui-navigation-toggle__arrow">
          ${ChevronDown()}
        </span>
      </label>
      <div class="ok-ui-navigation">
        <ul class="ok-ui-navigation__list">
          <li class="ok-ui-navigation__item ${selected === 1 ? 'ok-ui-navigation__item--selected' : ''}">
            <span class="ok-ui-navigation__icon">
              ${Loudhailer()}
            </span>
            <span class="ok-ui-navigation__label">${items[0]}</span>
          </li>
          <li class="ok-ui-navigation__item ${selected === 2 ? 'ok-ui-navigation__item--selected' : ''}">
            <span class="ok-ui-navigation__icon">
              ${Folder()}
            </span>
            <span class="ok-ui-navigation__label">${items[1]}</span>
          </li>
          <li class="ok-ui-navigation__item ${selected === 3 ? 'ok-ui-navigation__item--selected' : ''}">
            <span class="ok-ui-navigation__icon">
              ${Users()}
            </span>
            <span class="ok-ui-navigation__label">${items[2]}</span>
          </li>
          <li class="ok-ui-navigation__item ${selected === 4 ? 'ok-ui-navigation__item--selected' : ''}">
            <span class="ok-ui-navigation__icon">
              ${Download()}
            </span>
            <span class="ok-ui-navigation__label">${items[3]}</span>
          </li>
        </ul>
      </div>
    </div>
  `
};