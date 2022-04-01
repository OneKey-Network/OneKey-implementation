import { BasePafWidget } from './base/base-paf-widget';
import { IWelcomeWidgetProps, WelcomeWidget } from '../containers/welcome-widget/WelcomeWidget';

export class PromptConsent extends BasePafWidget<IWelcomeWidgetProps> {
  constructor(props: IWelcomeWidgetProps) {
    const emitConsent = (value: boolean) => {
      this.remove();
      props.emitConsent(value);
    };
    super(WelcomeWidget, { ...props, emitConsent });
  }
}
