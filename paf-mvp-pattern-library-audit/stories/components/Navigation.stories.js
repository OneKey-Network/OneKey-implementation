import NavigationComponent from './Navigation';

export default {
};

export const Navigation = NavigationComponent.bind({});
Navigation.args = {
  selected: 1
};

export const GermanLanguage = NavigationComponent.bind({});
GermanLanguage.args = {
  selected: 1,
  items: ['Inserat', 'Deine Daten', 'Teilnehmer' ,'Download']
};
