import { IProcessingQueue } from './utils/queue';
import { IOneKeyLib } from '@onekey/frontend/lib/paf-lib';

export type Window = WindowProxy &
  typeof globalThis & {
    OneKey: IOneKeyLib & {
      queue?: IProcessingQueue;
    };
  };
