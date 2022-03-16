import { BasePafWidget } from './base/base-paf-widget';
import { INotificationProps, Notification } from '../containers/notification/Notification';
import { notificationService } from '../services/notification.service';

export class NotificationWidget extends BasePafWidget<INotificationProps> {
  constructor(props: INotificationProps) {
    const destroy = () => {
      notificationService.removeWidget();
      props.destroy?.();
    }
    super(Notification, { ...props, destroy });
  }
}
