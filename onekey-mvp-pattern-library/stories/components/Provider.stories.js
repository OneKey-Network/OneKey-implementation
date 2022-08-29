import ProviderComponent from './Provider';

export default {
  title: 'Components/Provider'
};

export const Provider = ProviderComponent.bind({});
Provider.args = {
  name: 'The provider name',
  positive: true
};
