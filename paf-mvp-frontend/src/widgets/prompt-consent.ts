import { BasePafWidget } from './base/base-paf-widget';
import { IWelcomeWidgetProps, WelcomeWidget } from '../containers/welcome-widget/WelcomeWidget';

export class PromptConsent extends BasePafWidget<IWelcomeWidgetProps> {
  constructor(props: IWelcomeWidgetProps) {
    const emitConsent = (value: boolean) => {
      this.remove();
      props.emitConsent(value)
    }
    const destroy = () => {
      this.remove();
      props.destroy?.();
    }
    super(WelcomeWidget, { ...props, emitConsent, destroy });
  }
}
