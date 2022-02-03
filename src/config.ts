import {publicKeyFromString} from "paf-mvp-core-js/dist/crypto/keys";

export const isHttps = true
export const protocol = isHttps ? 'https' : 'http'

export interface Config {
    host: string;
}

export interface PrebidConfig extends Config {
    publicKey: string;
    privateKey: string;
}

export const prebidDomain = '.prebidsso.com'

export const advertiser: PrebidConfig = {
    host: 'advertiser.com',
    publicKey: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEUnarwp0gUZgjb9fsYNLcNrddNKV5
h4/WfMRMVh3HIqojt3LIsvUQig1rm9ZkcNx+IHZVhDM+hso2sXlGjF9xOQ==
-----END PUBLIC KEY-----`,
    privateKey: `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgxrHgVC3uFlEqnqab
cPqLNBFbMbt1tAPsvKy8DBV2m+ChRANCAARSdqvCnSBRmCNv1+xg0tw2t100pXmH
j9Z8xExWHcciqiO3csiy9RCKDWub1mRw3H4gdlWEMz6GyjaxeUaMX3E5
-----END PRIVATE KEY-----`,
}

export const cmp: PrebidConfig = {
    host: 'cmp.com',
    publicKey: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEl0278pcupaxUfiqHJ9AG9gVMyIO+
n07PJaNI22v+s7hR1Hkb71De6Ot5Z4JLoZ7aj1xYhFcQJsYkFlXxcBWfRQ==
-----END PUBLIC KEY-----`,
    privateKey: `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg0X8r0PYAm3mq206o
CdMHwZ948ONyVJToeFbLqBDKi7OhRANCAASXTbvyly6lrFR+Kocn0Ab2BUzIg76f
Ts8lo0jba/6zuFHUeRvvUN7o63lngkuhntqPXFiEVxAmxiQWVfFwFZ9F
-----END PRIVATE KEY-----`,
}

export const operator: PrebidConfig = {
    host: `operator${prebidDomain}`,
    publicKey: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEEiZIRhGxNdfG4l6LuY2Qfjyf60R0
jmcW7W3x9wvlX4YXqJUQKR2c0lveqVDj4hwO0kTZDuNRUhgxk4irwV3fzw==
-----END PUBLIC KEY-----`,
    privateKey: `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgxK7RQm5KP1g62SQn
oyeE+rrDPJzpZxIyCCTHDvd1TRShRANCAAQSJkhGEbE118biXou5jZB+PJ/rRHSO
ZxbtbfH3C+VfhheolRApHZzSW96pUOPiHA7SRNkO41FSGDGTiKvBXd/P
-----END PRIVATE KEY-----`,
}

export const publisher: PrebidConfig = {
    host: 'publisher.com',
    publicKey: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEM5QkveaeWF0LMKZcHXaUD3qCuiqd
Y1cgsD2zjtqivlniFJ3GOWF/kRZWd+Ls6ADsYf3BOwaWG0hOTvKA8xAg1A==
-----END PUBLIC KEY-----`,
    privateKey: `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgH2FVPBIcFMVup9fe
kHj+XwM3pkSuBVCIxzxwbR6+FB+hRANCAAQzlCS95p5YXQswplwddpQPeoK6Kp1j
VyCwPbOO2qK+WeIUncY5YX+RFlZ34uzoAOxh/cE7BpYbSE5O8oDzECDU
-----END PRIVATE KEY-----`,
}

export const portal: PrebidConfig = {
    host: `portal${prebidDomain}`,
    publicKey: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEasA7VcBrU8fs2P+Z4xmcZ8bhnj3Q
Ku3ypZLhzircDPwCeqAUye/pd62OX3zSWZFQQdz7fR93Bztwc7ZodYe8UQ==
-----END PUBLIC KEY-----`,
    privateKey: `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgiDfb74JY+vBjdEmr
hScLNr4U4Wrp4dKKMm0Z/+h3OnahRANCAARqwDtVwGtTx+zY/5njGZxnxuGePdAq
7fKlkuHOKtwM/AJ6oBTJ7+l3rY5ffNJZkVBB3Pt9H3cHO3Bztmh1h7xR
-----END PRIVATE KEY-----`
}

export const cdn: Config = {
    host: `cdn${prebidDomain}`,
}

export const publicKeys = {
    [advertiser.host]: publicKeyFromString(advertiser.publicKey),
    [cmp.host]: publicKeyFromString(cmp.publicKey),
    [publisher.host]: publicKeyFromString(publisher.publicKey),
    [operator.host]: publicKeyFromString(operator.publicKey),
    [portal.host]: publicKeyFromString(portal.publicKey),
}

