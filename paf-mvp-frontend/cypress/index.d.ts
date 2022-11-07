import { IProcessingQueue } from '../src/utils/queue';
import { IOneKeyLib } from '../src/lib/i-one-key-lib';

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      shouldNotContainClass(className: string): Chainable<Subject>;
      shouldContainClass(className: string): Chainable<Subject>;
    }
  }

  interface Window {
    OneKey: IOneKeyLib & {
      queue?: IProcessingQueue;
    };
  }
}

export {};
