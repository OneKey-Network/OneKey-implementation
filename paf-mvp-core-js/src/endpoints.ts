// TODO refactor to group by operator / operator proxy

// Endpoints exposed by the operator API
export const redirectEndpoints = {
    read: '/v1/redirect/get-ids-prefs',
    write: '/v1/redirect/post-ids-prefs'
}
export const jsonEndpoints = {
    read: '/v1/ids-prefs',
    write: '/v1/ids-prefs',
    verify3PC: '/v1/3pc',
    newId: '/v1/new-id',
    identity: '/v1/identity'
}

// Endpoints exposed by the operator proxy
const proxyPrefix = '/paf-proxy'
export const jsonProxyEndpoints = {
    verifyRead: `${proxyPrefix}/v1/verify/read`,
    signWrite: `${proxyPrefix}/v1/sign/write`,
    signPrefs: `${proxyPrefix}/v1/sign/prefs`,
    read: `${proxyPrefix}${jsonEndpoints.read}`,
    write: `${proxyPrefix}${jsonEndpoints.write}`,
    verify3PC: `${proxyPrefix}${jsonEndpoints.verify3PC}`,
    newId: `${proxyPrefix}${jsonEndpoints.newId}`,
}
export const redirectProxyEndpoints = {
    read: `${proxyPrefix}${redirectEndpoints.read}`,
    write: `${proxyPrefix}${redirectEndpoints.write}`,
}

export const proxyUriParams = {
    returnUrl: 'returnUrl',
    message: 'message'
}
