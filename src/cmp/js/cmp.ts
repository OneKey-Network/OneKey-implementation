/**
 * TODO For the moment, issues to properly import prebid lib in Typescript and at the same time have a small webpack compilation
 * TODO To have a small generated CMP.js file, do the following:
 * - comment this import
 * - add // @ts-ignore before each Prebid.xxxx call
 */
import * as Prebid from "../../../paf-mvp-frontend/src/lib/prebid-sso-lib";

// TODO should protocol be a parameter?
const proxyBase = 'https://cmp.com';

export const cmpCheck = async () => {
    const prebidData = await Prebid.getIdAndPreferences(proxyBase);

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
        const signedPreferences = await Prebid.signPreferences(proxyBase, {identifier: returnedId, optIn})

        // 2. write
        await Prebid.writeIdAndPref(proxyBase, {
            identifiers: prebidData.identifiers,
            preferences: signedPreferences
        })
    }

}
