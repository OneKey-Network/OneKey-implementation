import { NotificationEnum } from './enums/notification.enum';
import { IProcessingQueue } from './utils/queue';
import { IOneKeyLib } from '@frontend/lib/i-one-key-lib';

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
