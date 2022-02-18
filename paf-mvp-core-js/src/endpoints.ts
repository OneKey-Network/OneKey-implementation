// TODO refactor to group endpoints and params
export const proxyEndpoints = {
    verifyRedirectRead: '/verify/redirectRead',
    signWrite: '/sign/write',
    signPrefs: '/sign/prefs',
}

export const proxyUriParams = {
    returnUrl: 'returnUrl',
    message: 'message'
}

// Endpoints exposed by the operator API
export const redirectEndpoints = {
    read: '/v1/redirect/get-ids-prefs',
    write: "/v1/redirect/post-ids-prefs"
}
export const jsonEndpoints = {
    read: '/v1/ids-prefs',
    write: "/v1/ids-prefs",
    verify3PC: '/v1/3pc',
    newId: '/v1/new-id',
    identity: '/v1/identity'
}
