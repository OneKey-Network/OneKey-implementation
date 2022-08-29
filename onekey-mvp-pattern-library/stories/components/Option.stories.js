import Option from './Option';

export default {
  title: 'Components/Option'
};

export const Default = Option.bind({});
Default.args = {
  title: 'Turn on personalized marketing',
  description: 'See more relevant content and ads.'
};
