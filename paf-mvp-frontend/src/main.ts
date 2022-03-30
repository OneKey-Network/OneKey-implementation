import './polyfills/assign';
import './styles.scss';
import { PromptConsent } from './widgets/prompt-consent';
import { notificationService } from './services/notification.service';

const promptConsent = () => new Promise<boolean>((resolve) => new PromptConsent({ emitConsent: resolve }).render());

notificationService.displayDelayedNotification();

window.__promptConsent = promptConsent;
