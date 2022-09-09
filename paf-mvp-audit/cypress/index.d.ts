import { IProcessingQueue } from '../../paf-mvp-frontend/src/utils/queue';
import { IOneKeyLib } from '../../paf-mvp-frontend/src/lib/paf-lib';

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
