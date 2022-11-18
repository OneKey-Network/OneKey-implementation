const addPrefix = (config: { [key: string]: { rest?: string; redirect?: string } }, prefix: string) =>
  Object.values(config).forEach((v) => {
    if (v.rest) {
      v.rest = prefix + v.rest;
    }
    if (v.redirect) {
      v.redirect = prefix + v.redirect;
    }
  });

/**
 * Any participant to OneKey.
 * ⚠️ Note that a prefix is added on next line
 */
export const participant = {
  identity: {
    rest: 'identity',
  },
};
addPrefix(participant, '/paf/v1/');

/**
 * Routes exposed by the operator API.
 * ⚠️ Note that a prefix is added on next line
 */
export const operator = {
  read: {
    rest: 'ids-prefs',
    redirect: 'redirect/get-ids-prefs',
  },
  write: {
    rest: 'ids-prefs',
    redirect: 'redirect/post-ids-prefs',
  },
  delete: {
    rest: 'ids-prefs',
    redirect: 'redirect/delete-ids-prefs',
  },
  verify3PC: {
    rest: '3pc',
  },
  newId: {
    rest: 'new-id',
  },
};
addPrefix(operator, '/paf/v1/');

/**
 * Routes exposed by the client node.
 * ⚠️ Note that a prefix is added on next line
 */
export const client = {
  // Note these routes are a copy of the operator routes
  read: {
    rest: 'ids-prefs',
    redirect: 'redirect/get-ids-prefs',
  },
  write: {
    rest: 'ids-prefs',
    redirect: 'redirect/post-ids-prefs',
  },
  delete: {
    rest: 'ids-prefs',
    redirect: 'redirect/delete-ids-prefs',
  },
  verify3PC: {
    rest: '3pc',
  },
  newId: {
    rest: 'new-id',
  },

  // Other specific routes
  verifyRead: {
    rest: 'verify/read',
  },
  verifySeed: {
    rest: 'verify/seed',
  },
  verifyTransmission: {
    rest: 'verify/transmissionResult',
  },
  signPrefs: {
    rest: 'sign/prefs',
  },
  createSeed: {
    rest: 'seed',
  },
};
addPrefix(client, '/paf-proxy/v1/');

/**
 * URI parameters used by the client node
 */
export const clientUriParams = {
  returnUrl: 'returnUrl',
  message: 'message',
};
