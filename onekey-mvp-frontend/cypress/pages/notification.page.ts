import { BasePage } from './base';
import { NotificationEnum } from '../../src/enums/notification.enum';

export class NotificationPage extends BasePage {
  open(notificationType: NotificationEnum) {
    super.open();
    cy.window().then((win) => win.OneKey.showNotification(notificationType));
  }

  get closeBtn() {
    return this.widget.findByTestId('notification-close-btn');
  }

  get content() {
    return this.widget.findByTestId('notification-content');
  }

  get container() {
    return this.widget.findByTestId('notification-container');
  }
}
