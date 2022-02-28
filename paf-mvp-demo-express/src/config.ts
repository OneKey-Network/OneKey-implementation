export const isHttps = false
export const protocol = isHttps ? 'https' : 'http'

export interface Config {
    host: string;
    name: string;
}

export interface PrebidConfig extends Config {
    publicKey: string;
    privateKey: string;
    type: "vendor" | "operator" // TODO should support more
}

export const advertiser: PrebidConfig = {
    name: 'The advertiser CORP',
    host: 'www.pafmarket.shop',
    type: "vendor",
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
    name: 'The CMP CORP',
    host: 'www.crto-poc-2.com',
    type: "vendor",
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
    name: 'Some PAF operator',
    host: 'crto-poc-1.com',
    type: "operator",
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
    name: 'The publisher CORP',
    host: 'www.pafdemopublisher.com',
    type: "vendor",
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
    name: 'A PAF portal',
    type: "vendor",
    host: `www.crto-poc-1.com`,
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
    host: `crto-poc-2.com`,
    name: 'CDN'
}

