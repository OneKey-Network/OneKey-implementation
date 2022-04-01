import { NotificationWidget } from '../widgets/notification';
import { NotificationEnum } from '../enums/notification.enum';

class NotificationService {
  private currentWidget: NotificationWidget;

  showNotification(type: NotificationEnum) {
    if (this.currentWidget) {
      this.removeWidget();
    }

    this.currentWidget = new NotificationWidget({ type, destroy: () => this.removeWidget() });
    this.currentWidget.render();
  }

  removeWidget() {
    this.currentWidget?.remove();
    this.currentWidget = undefined;
  }
}

export const notificationService = new NotificationService();
