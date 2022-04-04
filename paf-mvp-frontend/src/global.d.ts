import {
  getIdsAndPreferences,
  refreshIdsAndPreferences,
  signPreferences,
  writeIdsAndPref,
  getNewId,
} from './lib/paf-lib';

declare global {
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
