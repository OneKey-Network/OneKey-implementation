import {publicKeyFromString} from "@core/crypto/keys";
import {advertiser, cmp, operator, portal, publisher} from "./config";

export const publicKeys = {
    [advertiser.host]: publicKeyFromString(advertiser.currentPublicKey.publicKey),
    [cmp.host]: publicKeyFromString(cmp.currentPublicKey.publicKey),
    [publisher.host]: publicKeyFromString(publisher.currentPublicKey.publicKey),
    [operator.host]: publicKeyFromString(operator.currentPublicKey.publicKey),
    [portal.host]: publicKeyFromString(portal.currentPublicKey.publicKey),
}
