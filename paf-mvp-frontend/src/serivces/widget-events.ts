import { Observable } from '../tools/observable';

export interface IWidgetEvent {
  type: string,
  payload?: any
}

export class WidgetEvents {
  private eventsSubscription = new Observable();

  getSubscription() {
    return this.eventsSubscription;
  }

  emitEvent(event: IWidgetEvent) {
    this.eventsSubscription.emit(event)
  }
}
