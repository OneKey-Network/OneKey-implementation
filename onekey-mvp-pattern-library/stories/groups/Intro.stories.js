import Button from '../components/Button';
import Card, { CardActions, CardBody, CardFooter, CardHeader, CardHeaderLogo } from '../components/Card';

export default {
  title: 'Groups/Intro',
  parameters: {
    layout: 'fullscreen',
  },
};

export const Intro = () => `
  ${Card({ children: `
    ${CardHeader({ children: `
      ${CardActions({ children: `
        ${CardHeaderLogo({ center: true })}
      ` })}

      <h1 class="ok-ui-heading-1">Manage your data and cookies</h1>
    `})}

    ${CardBody({ children: `
      <p>Advertising funds your access to our site.<br>
        We’ve partnered with OneKey to manage whether you prefer standard or personalized marketing when accessing participating websites. OneKey relies on a random digital ID that is an essential part of how our website operates and is used to ensure all recipients understand your preferences.</p>
      
      <p>We and our partners may also use information linked to these IDs to improve our overall service. By opting-into personalized content and ads, we can improve your online experience.</p>
      
      <p>If you choose not to participate, you will receive targeted content that is unrelated to your browsing activity or interactions.</p>
      
      <p>You can learn more or manage your choices at any time by going to ‘Privacy settings’ at the bottom of any page on our site.</p>
    `})}

    ${CardFooter({ children: `
      ${CardActions({ children: `
        ${Button({ style: 'filled', label: 'Refuse all' })}
        ${Button({ style: 'filled', label: 'Proceed' })}
      `})}
    `})}
  `})}
`;
