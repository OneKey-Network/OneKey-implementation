import {KeyInfo} from "@core/crypto/identity";

export interface PublicConfig {
    name: string;
    host: string;
    cdnHost?: string;
}

export interface PrivateConfig {
    currentPublicKey: KeyInfo;
    privateKey: string;
    type: "vendor" | "operator" // TODO should support more
}

export const advertiserConfig: PublicConfig = {
    name: 'The advertiser CORP',
    host: 'www.pafmarket.shop',
    cdnHost: 'cdn.pafmarket.shop'
}

export const publisherConfig: PublicConfig = {
    name: 'The publisher CORP',
    host: 'www.pafdemopublisher.com',
    cdnHost: 'cdn.pafdemopublisher.com'
}

export const cmpConfig: PublicConfig = {
    name: 'The CMP used by the publisher',
    host: 'cmp.pafdemopublisher.com',
}

export const operatorConfig: PublicConfig = {
    name: 'Some PAF operator',
    host: 'crto-poc-1.onekey.network'
}

export const portalConfig: PublicConfig = {
    name: 'A PAF portal',
    host: `portal.onekey.network`
}
