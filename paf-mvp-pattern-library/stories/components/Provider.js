import Button from './Button';
import { GreenCircleTickIcon, RedCircleCrossIcon, MailIcon, ExternalIcon } from './Icons';

export default (args) => {
  return `
    <div class="ok-ui-provider">
      ${args.positive ? GreenCircleTickIcon() : RedCircleCrossIcon()}

      <h2 class="ok-ui-heading-1">${args.name}</h2>

      ${Button({ style: 'text', size: 'small', iconOnly: true, iconPosition: 'start', icon: MailIcon() })}

      ${Button({ style: 'text', size: 'small', iconOnly: true, iconPosition: 'start', icon: ExternalIcon() })}
    </div>
  `;
};