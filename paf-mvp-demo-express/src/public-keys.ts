import {publicKeyFromString} from "@core/crypto/keys";
import {advertiser, cmp, operator, portal, publisher} from "./config";

export const publicKeys = {
    [advertiser.host]: publicKeyFromString(advertiser.publicKey),
    [cmp.host]: publicKeyFromString(cmp.publicKey),
    [publisher.host]: publicKeyFromString(publisher.publicKey),
    [operator.host]: publicKeyFromString(operator.publicKey),
    [portal.host]: publicKeyFromString(portal.publicKey),
}
