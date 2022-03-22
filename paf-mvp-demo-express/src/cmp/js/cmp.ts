import {refreshIdsAndPreferences, signPreferences, writeIdsAndPref} from '@frontend/lib/paf-lib';
import {cmpConfig} from '../../config';
import {PafStatus} from '@core/operator-client-commons';

declare const PAF: {
    refreshIdsAndPreferences: typeof refreshIdsAndPreferences,
    signPreferences: typeof signPreferences,
    writeIdsAndPref: typeof writeIdsAndPref,
};
declare global {
    interface Window {
        __promptConsent: () => Promise<boolean>
    }
}

// Using the CMP backend as a PAF operator proxy
const proxyHostName = cmpConfig.host;

export const cmpCheck = async () => {
    const {status, data} = await PAF.refreshIdsAndPreferences({proxyHostName, triggerRedirectIfNeeded: true});

    if (status === PafStatus.REDIRECT_NEEDED || status === PafStatus.NOT_PARTICIPATING) {
        // Will trigger a redirect, nothing more to do
        return;
    }

    const returnedId = data.identifiers?.[0];
    const hasPersistedId = returnedId && (returnedId.persisted !== false);

    if (!hasPersistedId || data.preferences === undefined) {
        const optIn = await window.__promptConsent();
        // 1. sign preferences
        const unsignedPreferences = {
            version: '0.1',
            data: {
                use_browsing_for_personalization: optIn
            }
        };
        const signedPreferences = await PAF.signPreferences({proxyHostName}, {
            identifiers: data.identifiers,
            unsignedPreferences
        });

        // 2. write
        await PAF.writeIdsAndPref({proxyHostName}, {
            identifiers: data.identifiers,
            preferences: signedPreferences
        });
    }

};
