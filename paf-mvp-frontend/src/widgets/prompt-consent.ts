import { BasePafWidget } from './base/base-paf-widget';
import { WelcomeWidget } from '../containers/welcome-widget/WelcomeWidget';
import { globalEventManager } from '../managers/event-manager';
import { IWidgetEvent } from '../serivces/widget-events';

export class PromptConsent extends BasePafWidget {
  constructor() {
    super('paf-root', WelcomeWidget);
  }

  bindEvents() {
    globalEventManager.getSubscription()
      .subscribe((widgetEvent: IWidgetEvent) => {
        const customEvent = new CustomEvent(widgetEvent.type, { detail: widgetEvent.payload });
        this.element.dispatchEvent(customEvent);
      });
  }

  getElement() {
    return this.element;
  }
}
