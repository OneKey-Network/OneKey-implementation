import ButtonComponent from './Button';

export default {
  title: 'Components/Button',
  argTypes: {
    style: {
      options: ['filled', 'outlined', 'text'],
      control: { type: 'radio' },
    },
    size: {
      options: ['large', 'small'],
      control: { type: 'radio' },
    },
    iconPosition: {
      options: ['start', 'end'],
      control: { type: 'radio' },
    },
  },
};

export const Button = ButtonComponent.bind({});
Button.args = {
  style: 'filled',
  label: 'Button',
  disabled: false,
  icon: false,
  iconPosition: 'start',
  size: 'large',
  iconOnly: false
};
