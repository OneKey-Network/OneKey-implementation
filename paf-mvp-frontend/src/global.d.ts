import { IOneKeyLib } from './lib/paf-lib';
import { NotificationEnum } from './enums/notification.enum';
import { IProcessingQueue } from './utils/queue';

export type Window = WindowProxy &
  typeof globalThis & {
    PAF: IOneKeyLib & {
      queue?: IProcessingQueue;
    };
    PAFUI: {
      // FIXME remove
      promptConsent: () => Promise<boolean>;
      showNotification: (notificationType: NotificationEnum) => void;
    };
  };
