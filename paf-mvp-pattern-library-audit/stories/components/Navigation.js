import { Folder, Users, Download, Loudhailer, ChevronDown } from './Icons';

export const NavigationState = () => `
  <input type="checkbox" id="ok-ui-navigation-toggle-state" class="ok-ui-navigation-toggle-state" />
`;

export default () => `
  <div class="ok-ui-navigation-wrapper">
    <label for="ok-ui-navigation-toggle-state" class="ok-ui-navigation-toggle ok-ui-navigation__item ok-ui-navigation__item--selected">
      <span class="ok-ui-navigation__icon">
        ${Loudhailer()}
      </span>

      <span class="ok-ui-navigation__label">Advert</span>

      <span class="ok-ui-navigation-toggle__arrow">
        ${ChevronDown()}
      </span>
    </label>
    <div class="ok-ui-navigation">
      <ul class="ok-ui-navigation__list">
        <li class="ok-ui-navigation__item ok-ui-navigation__item--selected">
          <span class="ok-ui-navigation__icon">
            ${Loudhailer()}
          </span>
          <span class="ok-ui-navigation__label">Advert</span>
        </li>
        <li class="ok-ui-navigation__item">
          <span class="ok-ui-navigation__icon">
            ${Folder()}
          </span>
          <span class="ok-ui-navigation__label">Your data</span>
        </li>
        <li class="ok-ui-navigation__item">
          <span class="ok-ui-navigation__icon">
            ${Users()}
          </span>
          <span class="ok-ui-navigation__label">Participants</span>
        </li>
        <li class="ok-ui-navigation__item">
          <span class="ok-ui-navigation__icon">
            ${Download()}
          </span>
          <span class="ok-ui-navigation__label">Download</span>
        </li>
      </ul>
    </div>
  </div>
`;