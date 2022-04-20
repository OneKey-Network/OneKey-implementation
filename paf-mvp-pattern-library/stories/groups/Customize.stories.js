import Card, { CardHeader, CardHeaderLogo, CardBody, CardFooter, CardActions } from '../components/Card';
import Button from '../components/Button';
import Toggle, { ToggleWrapper } from '../components/Toggle';
import { BackIcon } from '../components/Icons';

export default {
  title: 'Groups/Customize',
  parameters: {
    layout: 'fullscreen',
  },
};

export const Customize = () => `
  <form>
    ${Card({ children: `
      ${CardHeader({ children: `
        ${CardActions({ children: `
          ${CardHeaderLogo()}
      ` })}

        <p class="ok-ui-heading-2">Your current choice:</p>
        <h1 class="ok-ui-heading-1 ok-ui-mb-2">Standard marketing</h1>

        ${ToggleWrapper({ children: Toggle({ position: 'end', style: 'emphasis', description: 'Select all / unselect all' }) })}
      `})}

      ${CardBody({ children: `
        ${ToggleWrapper({ children: Toggle({ tooltip: true, position: 'end', description: 'Select and/or access information on a device', name: 'preference', value: '1' }) })}
        ${ToggleWrapper({ children: Toggle({ tooltip: true, position: 'end', description: 'Select basic ads', name: 'preference', value: '2' }) })}
        ${ToggleWrapper({ children: Toggle({ tooltip: true, position: 'end', description: 'Apply market research to generate audience insights', name: 'preference', value: '3' }) })}
        ${ToggleWrapper({ children: Toggle({ tooltip: true, position: 'end', description: 'Develop & improve products', name: 'preference', value: '4' }) })}
        ${ToggleWrapper({ children: Toggle({ tooltip: true, position: 'end', description: 'Ensure security, prevent fraud, and debug', name: 'preference', value: '5', disabled: true }) })}
        ${ToggleWrapper({ children: Toggle({ tooltip: true, position: 'end', description: 'Select and/or access information on a device', name: 'preference', value: '6' }) })}
        ${ToggleWrapper({ children: Toggle({ tooltip: true, position: 'end', description: 'Select basic ads', name: 'preference', value: '7' }) })}
        ${ToggleWrapper({ children: Toggle({ tooltip: true, position: 'end', description: 'Apply market research to generate audience insights', name: 'preference', value: '8' }) })}
        ${ToggleWrapper({ children: Toggle({ tooltip: true, position: 'end', description: 'Develop & improve products', name: 'preference', value: '9' }) })}
        ${ToggleWrapper({ children: Toggle({ tooltip: true, position: 'end', description: 'Ensure security, prevent fraud, and debug', name: 'preference', value: '10', disabled: true }) })}
        ${ToggleWrapper({ children: Toggle({ tooltip: true, position: 'end', description: 'Select and/or access information on a device', name: 'preference', value: '11' }) })}
        ${ToggleWrapper({ children: Toggle({ tooltip: true, position: 'end', description: 'Select basic ads', name: 'preference', value: '12' }) })}
        ${ToggleWrapper({ children: Toggle({ tooltip: true, position: 'end', description: 'Apply market research to generate audience insights', name: 'preference', value: '13' }) })}
        ${ToggleWrapper({ children: Toggle({ tooltip: true, position: 'end', description: 'Develop & improve products', name: 'preference', value: '14' }) })}
        ${ToggleWrapper({ children: Toggle({ tooltip: true, position: 'end', description: 'Ensure security, prevent fraud, and debug', name: 'preference', value: '15', disabled: true }) })}
        ${ToggleWrapper({ children: Toggle({ tooltip: true, position: 'end', description: 'Select and/or access information on a device', name: 'preference', value: '16' }) })}
        ${ToggleWrapper({ children: Toggle({ tooltip: true, position: 'end', description: 'Select basic ads', name: 'preference', value: '17' }) })}
        ${ToggleWrapper({ children: Toggle({ tooltip: true, position: 'end', description: 'Apply market research to generate audience insights', name: 'preference', value: '18' }) })}
        ${ToggleWrapper({ children: Toggle({ tooltip: true, position: 'end', description: 'Develop & improve products', name: 'preference', value: '19' }) })}
        ${ToggleWrapper({ children: Toggle({ tooltip: true, position: 'end', description: 'Ensure security, prevent fraud, and debug', name: 'preference', value: '20', disabled: true }) })}
      `})}

      ${CardFooter({ children: `
        ${CardActions({ children: `
          ${Button({ style: 'outlined', label: 'Back', icon: BackIcon() })}
          ${Button({ style: 'filled', label: 'Save' })}
        `})}
      `})}
    `})}
  </form>
`;
