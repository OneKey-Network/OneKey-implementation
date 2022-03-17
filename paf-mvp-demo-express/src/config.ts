import {KeyInfo} from "@core/crypto/identity";

export interface PublicConfig {
    host: string;
    name: string;
}

export interface PrivateConfig {
    currentPublicKey: KeyInfo;
    privateKey: string;
    type: "vendor" | "operator" // TODO should support more
}

export const advertiserConfig: PublicConfig = {
    name: 'The advertiser CORP',
    host: 'www.pafmarket.shop'
}

export const cmpConfig: PublicConfig = {
    name: 'The CMP CORP',
    host: 'www.crto-poc-2.com',
}

export const operatorConfig: PublicConfig = {
    name: 'Some PAF operator',
    host: 'crto-poc-1.com'
}

export const publisherConfig: PublicConfig = {
    name: 'The publisher CORP',
    host: 'www.pafdemopublisher.com'
}

export const portalConfig: PublicConfig = {
    name: 'A PAF portal',
    host: `www.crto-poc-1.com`
}

export const cdn: PublicConfig = {
    host: `www.crto-poc-2.com`, // /!\ is the same as CMP
    name: 'CDN'
}
