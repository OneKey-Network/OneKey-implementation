import OptionComponent from './Option';

export default {
  title: 'Components/Option'
};

export const Option = OptionComponent.bind({});
Option.args = {
  title: 'Turn on personalized marketing',
  description: 'See more relevant content and ads.'
};
