import Card, { CardActions, CardBody, CardFooter, CardHeader, CardHeaderLogo } from '../components/Card';
import Button from '../components/Button';
import { BackIcon } from '../components/Icons';

export default {
  title: 'Groups/About',
  parameters: {
    layout: 'fullscreen',
  },
};

export const About = () => `
  ${Card({ children: `
    ${CardHeader({ children: `
      <h1 class="ok-ui-heading-1">
        Learn more about
        ${CardHeaderLogo({ center: true })}
      </h1>
    `})}

    ${CardBody({ children: `
      <p>We believe you should have transparency and control over how, where, and why your data is used.</p>
      
      <p>We partnered with OneKey, a non-profit technology, to manage your marketing preferences when accessing Brandname.<br>
        OneKey relies on digital IDs to understand your activity and sends your preferences to our partner websites in order to customize the ads you see. IDs like these are an essential part of how Brandname's website operates and provides you with a more relevant experience.</p>
      
      <p>You may change your preferences at any time.<br>
        Your consent will automatically expire 2 years after you provide it. You have the right to be forgotten, which you can exercise at any time, and on any OneKey partner website simply by resetting your ID. You can also get a temporary ID by using the incognito/private browsing function of your browser.</p>
      
      <p>If you choose not to participate, you will still see ads unrelated to your browsing activity.</p>
      
      <p>You can learn more and manage your choices at any time by going to "Privacy settings" at the bottom of any page. See our Privacy Policy and Privacy Notice.</p>
    `})}

    ${CardFooter({ children: `
      ${CardActions({ children: `
        ${Button({ style: 'outlined', label: 'Back', icon: BackIcon() })}
      `})}
    `})}
  `})}
`;
