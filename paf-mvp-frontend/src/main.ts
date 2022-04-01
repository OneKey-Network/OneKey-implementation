import './polyfills/assign';
import './styles.scss';
import { PromptConsent } from './widgets/prompt-consent';
import { notificationService } from './services/notification.service';
import { NotificationEnum } from '@frontend/enums/notification.enum';

const promptConsent = () => {
  return new Promise<boolean>((resolve) => new PromptConsent({ emitConsent: (value) => resolve(value) }).render());
};

const showNotification = (type: NotificationEnum) => notificationService.showNotification(type);

window.PAFUI ??= { promptConsent, showNotification };
