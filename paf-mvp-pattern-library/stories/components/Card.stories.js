import Card, { CardHeader as CardHeaderComponent, CardActions, CardHeaderLogo, CardFooter as CardFooterComponent } from './Card';
import Button from './Button';
import { CrossIcon } from './Icons';

export default {
  title: 'Components/Card'
};

export const Default = Card.bind({});

export const CardHeader = () => `
  ${Card({ children: `
    ${CardHeaderComponent({ children: `
      ${CardActions({ children: `
        ${CardHeaderLogo()}

        ${Button({ style: 'text', label: 'Cancel', icon: CrossIcon(), iconPosition: 'end' })}
      ` })}

      <h1 class="ok-ui-heading-1">Choose your marketing preferences</h1>

      <p>OneKey signals your preferences that can enhance your experience across partner websites, without bothering you with future prompts or directly identifying you.</p>

      <p>By saving your preferences, you also agree to our site’s privacy policy.</p>
    `})}
  ` })}
`;

export const CardFooter = () => `
  ${Card({ children: `
    ${CardFooterComponent({ children: `
      ${CardActions({ children: `
        ${Button({ style: 'filled', label: 'Refuse all' })}
        ${Button({ style: 'filled', label: 'Save', disabled: true })}
      ` })}

      <p class="ok-ui-mt-2">Some optional additional footer content.</p>
    `})}
  ` })}
`;