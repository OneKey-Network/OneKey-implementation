import {
  refreshIdsAndPreferences,
  removeCookie,
  saveCookieValue,
  signPreferences,
  writeIdsAndPref,
} from '@frontend/lib/paf-lib';
import { PafStatus } from '@core/operator-client-commons';
import { Cookies } from '@core/cookies';
import { NotificationEnum } from '@frontend/enums/notification.enum';

declare const PAF: {
  refreshIdsAndPreferences: typeof refreshIdsAndPreferences;
  signPreferences: typeof signPreferences;
  writeIdsAndPref: typeof writeIdsAndPref;
};
declare const PAFUI: {
  promptConsent: () => Promise<boolean>;
  showNotification: (notificationType: NotificationEnum) => void;
};

export const cmpCheck = async ({ proxyHostName, forcePrompt }: { proxyHostName: string; forcePrompt?: boolean }) => {
  if (forcePrompt) {
    removeCookie(Cookies.identifiers);
    removeCookie(Cookies.preferences);
  }

  const { status, data } = await PAF.refreshIdsAndPreferences({ proxyHostName, triggerRedirectIfNeeded: true });

  if (status === PafStatus.REDIRECT_NEEDED || status === PafStatus.NOT_PARTICIPATING) {
    // Will trigger a redirect, nothing more to do
    return;
  }

  const returnedId = data.identifiers?.[0];
  const hasPersistedId = returnedId && returnedId.persisted !== false;

  if (!hasPersistedId || data.preferences === undefined) {
    // Reset cookies before to show the prompt to make sure we set the appropriate value only after user action
    removeCookie(Cookies.identifiers);
    removeCookie(Cookies.preferences);
    removeCookie(Cookies.lastRefresh);

    const optIn = await PAFUI.promptConsent();

    if (optIn === undefined) {
      // User closed the prompt consent without defining their preferences
      // => means they are not participating
      saveCookieValue(Cookies.identifiers, undefined);
      saveCookieValue(Cookies.preferences, undefined);
    } else {
      // 1. sign preferences
      const unsignedPreferences = {
        version: '0.1',
        data: {
          use_browsing_for_personalization: optIn,
        },
      };
      const signedPreferences = await PAF.signPreferences(
        { proxyHostName },
        {
          identifiers: data.identifiers,
          unsignedPreferences,
        }
      );

      // 2. write
      await PAF.writeIdsAndPref(
        { proxyHostName },
        {
          identifiers: data.identifiers,
          preferences: signedPreferences,
        }
      );
    }
  }
};
