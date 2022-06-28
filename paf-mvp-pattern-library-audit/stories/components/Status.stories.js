import StatusComponent, { StatusWrapper } from './Status';

export default {
  argTypes: {
    type: {
      options: ['good', 'suspicious', 'violation'],
      control: { type: 'radio' },
    },
    large: {
      control: { type: 'boolean' },
    },
  },
};

export const Status = StatusComponent.bind({});
Status.args = {
  type: 'good',
  large: false
};

export const WithLabel = () => StatusWrapper({
  type: 'good',
  large: false,
  children: 'The label'
});

export const WithLabelIconEnd = () => StatusWrapper({
  type: 'good',
  large: false,
  children: 'The label',
  iconPosition: 'end'
});