import { getIdsAndPreferences, signPreferences, writeIdsAndPref } from 'paf-mvp-frontend/dist/paf-lib'

declare const PAF: {
    getIdsAndPreferences: typeof getIdsAndPreferences,
    signPreferences: typeof signPreferences,
    writeIdsAndPref: typeof writeIdsAndPref
}

// TODO should protocol be a parameter?
const proxyBase = 'https://cmp.com';

export const cmpCheck = async () => {
    const prebidData = await PAF.getIdsAndPreferences(proxyBase);

    if (prebidData === undefined) {
        // Will trigger a redirect
        return;
    }
    
    const returnedId = prebidData.identifiers?.[0]
    const hasPersistedId = returnedId?.persisted === undefined || returnedId?.persisted

    if (!hasPersistedId || prebidData.preferences === undefined) {
        const optIn = confirm(`Hi, here's the CMP!
        
Please confirm if you want to opt-in, otherwise click cancel`)

        // 1. sign preferences
        const signedPreferences = await PAF.signPreferences(proxyBase, {identifier: returnedId, optIn})

        // 2. write
        await PAF.writeIdsAndPref(proxyBase, {
            identifiers: prebidData.identifiers,
            preferences: signedPreferences
        })
    }

}
