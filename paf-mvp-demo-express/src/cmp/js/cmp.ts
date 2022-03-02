import { refreshIdsAndPreferences, signPreferences, writeIdsAndPref } from '@frontend/lib/paf-lib'
import {cmp} from "../../config";

declare const PAF: {
    refreshIdsAndPreferences: typeof refreshIdsAndPreferences,
    signPreferences: typeof signPreferences,
    writeIdsAndPref: typeof writeIdsAndPref
}

// Using the CMP backend as a PAF operator proxy
const proxyBase = `https://${cmp.host}`;

export const cmpCheck = async () => {
    const pafData = await PAF.refreshIdsAndPreferences({proxyBase, triggerRedirectIfNeeded: true});

    if (pafData === undefined) {
        // Will trigger a redirect
        return;
    }
    
    const returnedId = pafData.identifiers?.[0]
    const hasPersistedId = returnedId?.persisted === undefined || returnedId?.persisted

    if (!hasPersistedId || pafData.preferences === undefined) {
        const optIn = confirm(`Hi, here's the CMP!
        
Please confirm if you want to opt-in, otherwise click cancel`)

        // 1. sign preferences
        const signedPreferences = await PAF.signPreferences({proxyBase}, {identifier: returnedId, optIn})

        // 2. write
        await PAF.writeIdsAndPref({proxyBase}, {
            identifiers: pafData.identifiers,
            preferences: signedPreferences
        })
    }

}
