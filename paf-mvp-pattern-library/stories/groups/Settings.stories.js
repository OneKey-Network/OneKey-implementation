import Card, { CardActions, CardBody, CardFooter, CardHeader, CardHeaderLogo } from '../components/Card';
import BrowsingID, { BrowsingIDWrapper } from '../components/BrowsingID';
import Button from '../components/Button';
import Option from '../components/Option';
import Toggle from '../components/Toggle';
import { CrossIcon } from '../components/Icons';

export default {
  title: 'Groups/Settings',
  parameters: {
    layout: 'fullscreen',
  },
};

export const Settings = () => `
  <form>
    ${Card({ children: `
      ${CardHeader({ children: `
        ${CardActions({ children: `
          ${CardHeaderLogo()}

          ${Button({ style: 'text', label: 'Cancel', icon: CrossIcon(), iconPosition: 'end' })}
        ` })}

        <h1 class="ok-ui-heading-1">Choose your marketing preferences</h1>

        <p>OneKey signals your preferences that can enhance your experience across partner websites, without bothering you with future prompts or directly identifying you.</p>
  
        <p>By saving your preferences, you also agree to our site’s privacy policy.</p>
      `})}

      ${CardBody({ children: `
        ${BrowsingIDWrapper({ children: BrowsingID({ id: 'NNNAZD567' }) })}

        ${Option({ title: 'Turn on personalized marketing', description: 'See more relevant content and ads.', value: '1' })}

        ${Option({ title: 'Turn on standard marketing', description: 'See generic content and ads.', value: '0' })}

        ${Button({ style: 'text', label: 'Customize your experience' })}

        <div class="ok-ui-mt-2">
          ${Toggle({ link: true, description: 'Apply preferences to this site only and re-ask on other OneKey sites.' })}
        </div>
      `})}

      ${CardFooter({ children: `
        ${CardActions({ children: `
          ${Button({ style: 'filled', label: 'Refuse all' })}
          ${Button({ style: 'filled', label: 'Save', disabled: true })}
        ` })}
      `})}
    `})}
  </form>
`;
