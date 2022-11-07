import { IProcessingQueue } from '../../paf-mvp-frontend/src/utils/queue';
import { IOneKeyLib } from '@onekey/frontend/lib/i-one-key-lib';

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      shouldNotContainClass(className: string): Chainable<Subject>;
      shouldContainClass(className: string): Chainable<Subject>;
    }
  }

  interface Window {
    OneKey: Partial<IOneKeyLib> & {
      queue?: IProcessingQueue;
    };
  }
}

export {};
