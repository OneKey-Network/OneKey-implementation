import Toggle, { ToggleWrapper } from './Toggle';

export default {
  title: 'Components/Toggle',
  argTypes: {
    position: {
      options: ['start', 'end'],
      control: { type: 'radio' },
    },
  },
};

export const Default = Toggle.bind({});
Default.args = {
  position: 'start',
  description: 'Apply preferences to this site only and re-ask on other OneKey sites',
  tooltip: false,
  disabled: false,
  link: false
};

export const WithLink = Toggle.bind({});
WithLink.args = {
  description: 'Apply preferences to this site only and re-ask on other OneKey sites.',
  link: true
};

export const WithWrapper = () => ToggleWrapper({ children: Toggle({ description: 'Wrapped toggle' }) });
