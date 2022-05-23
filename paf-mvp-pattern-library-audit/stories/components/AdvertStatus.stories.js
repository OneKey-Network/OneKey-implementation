import AdvertStatusComponent from './AdvertStatus';

export default {
  argTypes: {
    type: {
      options: ['loading', 'good', 'suspicious', 'violation'],
      control: { type: 'radio' },
    },
  },
};

export const AdvertStatus = AdvertStatusComponent.bind({});
AdvertStatus.args = {
  type: 'loading'
};
