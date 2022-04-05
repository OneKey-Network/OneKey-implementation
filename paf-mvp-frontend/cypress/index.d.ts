import {
  getIdsAndPreferences,
  refreshIdsAndPreferences,
  signPreferences,
  writeIdsAndPref,
  getNewId,
} from '../src/lib/paf-lib';

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      shouldNotContainClass(className: string): Chainable<Subject>;
      shouldContainClass(className: string): Chainable<Subject>;
    }
  }

  interface Window {
    PAF: {
      getNewId: typeof getNewId;
      signPreferences: typeof signPreferences;
      writeIdsAndPref: typeof writeIdsAndPref;
      getIdsAndPreferences: typeof getIdsAndPreferences;
      refreshIdsAndPreferences: typeof refreshIdsAndPreferences;
    };
    __promptConsent: () => Promise<boolean>;
  }
}

export {};
