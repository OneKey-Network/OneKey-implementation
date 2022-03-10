// TODO refactor to group by operator / operator proxy

// Endpoints exposed by the operator API
const operatorPrefix = '/paf'
const redirectRead = '/v1/redirect/get-ids-prefs';
const redirectWrite = '/v1/redirect/post-ids-prefs';
export const redirectEndpoints = {
    read: `${operatorPrefix}${redirectRead}`,
    write: `${operatorPrefix}${redirectWrite}`
}
const jsonRead = '/v1/ids-prefs';
const jsonWrite = '/v1/ids-prefs';
const jsonVerify3PC = '/v1/3pc';
const jsonNewId = '/v1/new-id';
const identity = '/v1/identity';
export const jsonOperatorEndpoints = {
    read: `${operatorPrefix}${jsonRead}`,
    write: `${operatorPrefix}${jsonWrite}`,
    verify3PC: `${operatorPrefix}${jsonVerify3PC}`,
    newId: `${operatorPrefix}${jsonNewId}`,
    identity: `${operatorPrefix}${identity}`
}

// Endpoints exposed by the operator proxy
const proxyPrefix = '/paf-proxy'
const jsonVerifyRead = `/v1/verify/read`;
const jsonSignWrite = `/v1/sign/write`;
const jsonSignPrefs = `/v1/sign/prefs`;
export const jsonProxyEndpoints = {
    verifyRead: `${proxyPrefix}${jsonVerifyRead}`,
    signWrite: `${proxyPrefix}${jsonSignWrite}`,
    signPrefs: `${proxyPrefix}${jsonSignPrefs}`,
    read: `${proxyPrefix}${jsonRead}`,
    write: `${proxyPrefix}${jsonWrite}`,
    verify3PC: `${proxyPrefix}${jsonVerify3PC}`,
    newId: `${proxyPrefix}${jsonNewId}`,
}
export const redirectProxyEndpoints = {
    read: `${proxyPrefix}${redirectEndpoints.read}`,
    write: `${proxyPrefix}${redirectEndpoints.write}`,
}

export const proxyUriParams = {
    returnUrl: 'returnUrl',
    message: 'message'
}
