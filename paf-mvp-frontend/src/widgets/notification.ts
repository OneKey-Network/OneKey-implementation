import { BasePafWidget } from './base/base-paf-widget';
import { INotificationProps, Notification } from '../containers/notification/Notification';

export class NotificationWidget extends BasePafWidget<INotificationProps> {
  constructor(props: INotificationProps) {
    super(Notification, props);
  }
}
