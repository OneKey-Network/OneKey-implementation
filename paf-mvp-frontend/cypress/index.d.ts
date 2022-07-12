import { IOneKeyLib } from '../src/lib/i-one-key-lib';
import { IProcessingQueue } from '../src/utils/queue';

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      shouldNotContainClass(className: string): Chainable<Subject>;
      shouldContainClass(className: string): Chainable<Subject>;
    }
  }

  interface Window {
    PAF: IOneKeyLib & {
      queue?: IProcessingQueue;
    };
  }
}

export {};
