import Card, { CardHeader, CardHeaderLogo, CardBody, CardFooter, CardActions } from '../components/Card';
import Button from '../components/Button';
import Provider from '../components/Provider';

export default {
  title: 'Groups/Audit',
  parameters: {
    layout: 'fullscreen',
  },
};

export const Audit = () => `
  <form>
    ${Card({ children: `
      ${CardHeader({ children: `
        ${CardActions({ children: `
          ${CardHeaderLogo()}
        ` })}

        <h1 class="ok-ui-heading-1 ok-ui-mb-2">Your ad-funded access</h1>
        <p>The following OneKey participating providers funded your access to this site’s content. These organizations do not directly identify you, but rely instead on your OneKey ID and preferences for this purpose. Your OneKey ID will automatically reset every 6 months or you can reset your ID or preference at any time by clicking&nbsp;<a href="#">here</a>.</p>
      `})}

      ${CardBody({ children: `
        ${Provider({ positive: true, name: 'The provider name' })}
        ${Provider({ positive: false, name: 'The provider name' })}
        ${Provider({ positive: true, name: 'The provider name' })}
        ${Provider({ positive: true, name: 'The provider name' })}
        ${Provider({ positive: true, name: 'The provider name' })}
        ${Provider({ positive: true, name: 'A really long provider name that will wrap around' })}
        ${Provider({ positive: true, name: 'The provider name' })}
        ${Provider({ positive: true, name: 'The provider name' })}
        ${Provider({ positive: true, name: 'The provider name' })}
        ${Provider({ positive: true, name: 'The provider name' })}
      `})}

      ${CardFooter({ children: `
        ${Button({ style: 'outlined', label: 'Download text file' })}

        <p class="ok-ui-mt-2">If you believe an organization didn’t honour your preferences, click the email icon to send them this audit for investigation. You may also download the same audit data to send to the appropriate government authority.</p>
      `})}
    `})}
  </form>
`;
