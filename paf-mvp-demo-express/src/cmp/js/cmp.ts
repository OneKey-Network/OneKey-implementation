import { refreshIdsAndPreferences, signPreferences, writeIdsAndPref } from '@frontend/lib/paf-lib';
import {cmp} from "../../config";

declare const PAF: {
    refreshIdsAndPreferences: typeof refreshIdsAndPreferences,
    signPreferences: typeof signPreferences,
    writeIdsAndPref: typeof writeIdsAndPref,
}
declare global {
    interface Window {
        __promptConsent: () => Promise<boolean>
    }
}

// Using the CMP backend as a PAF operator proxy
const proxyHostName = cmp.host;

export const cmpCheck = async () => {
    const pafData = await PAF.refreshIdsAndPreferences({proxyHostName, triggerRedirectIfNeeded: true});

    if (pafData === undefined) {
        // Will trigger a redirect
        return;
    }

    const returnedId = pafData.identifiers?.[0]
    const hasPersistedId = returnedId?.persisted === undefined || returnedId?.persisted

    if (!hasPersistedId || pafData.preferences === undefined) {
        const optIn = await window.__promptConsent();
        // 1. sign preferences
        const unsignedPreferences = {
            version: "0.1",
            data: {
                use_browsing_for_personalization: optIn
            }
        };
        const signedPreferences = await PAF.signPreferences({proxyHostName}, {
            identifiers: pafData.identifiers,
            unsignedPreferences
        })

        // 2. write
        await PAF.writeIdsAndPref({proxyHostName}, {
            identifiers: pafData.identifiers,
            preferences: signedPreferences
        })
    }

}
