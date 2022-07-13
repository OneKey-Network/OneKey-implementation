import { IProcessingQueue } from './utils/queue';
import { IOneKeyLib } from '@frontend/lib/paf-lib';

export type Window = WindowProxy &
  typeof globalThis & {
    PAF: IOneKeyLib & {
      queue?: IProcessingQueue;
    };
  };
