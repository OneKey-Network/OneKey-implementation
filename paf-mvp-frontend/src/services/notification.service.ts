import { NotificationWidget } from '../widgets/notification';
import { NotificationEnum } from '../enums/notification.enum';

class NotificationService {
  private currentWidget: NotificationWidget;
  private afterRedirectNotificationStorage = 'PAF_delayed_notification';

  showNotification(type: NotificationEnum) {
    if (this.currentWidget) {
      this.removeWidget();
    }
    this.displayAfterRedirect(type);
    this.currentWidget = new NotificationWidget({ type });
    this.currentWidget.render();
  }

  removeWidget() {
    this.currentWidget?.remove();
    this.currentWidget = undefined;
    localStorage.removeItem(this.afterRedirectNotificationStorage);
  }

  displayDelayedNotification() {
    const type: NotificationEnum = localStorage.getItem(this.afterRedirectNotificationStorage) as NotificationEnum;
    if (type) {
      this.showNotification(type);
    }
  }

  private displayAfterRedirect(type: NotificationEnum) {
    localStorage.setItem(this.afterRedirectNotificationStorage, type);
  }
}

export const notificationService = new NotificationService();
