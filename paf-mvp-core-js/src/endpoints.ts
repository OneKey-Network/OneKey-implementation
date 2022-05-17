// TODO refactor to group by operator / PAF client node

// Endpoints exposed by the operator API
const pafPrefix = '/paf';
const redirectRead = '/v1/redirect/get-ids-prefs';
const redirectWrite = '/v1/redirect/post-ids-prefs';
export const redirectEndpoints = {
  read: `${pafPrefix}${redirectRead}`,
  write: `${pafPrefix}${redirectWrite}`,
};
const jsonRead = '/v1/ids-prefs';
const jsonWrite = '/v1/ids-prefs';
const jsonVerify3PC = '/v1/3pc';
const jsonNewId = '/v1/new-id';
const jsonSeed = '/v1/seed';
const identity = '/v1/identity';

export const jsonOperatorEndpoints = {
  read: `${pafPrefix}${jsonRead}`,
  write: `${pafPrefix}${jsonWrite}`,
  verify3PC: `${pafPrefix}${jsonVerify3PC}`,
  newId: `${pafPrefix}${jsonNewId}`,
};

export const participantEndpoints = {
  identity: `${pafPrefix}${identity}`,
};

// Endpoints exposed by the PAF client node
const proxyPrefix = '/paf-proxy';
const jsonVerifyRead = '/v1/verify/read';
const jsonSignWrite = '/v1/sign/write';
const jsonSignPrefs = '/v1/sign/prefs';
export const jsonProxyEndpoints = {
  verifyRead: `${proxyPrefix}${jsonVerifyRead}`,
  signWrite: `${proxyPrefix}${jsonSignWrite}`,
  signPrefs: `${proxyPrefix}${jsonSignPrefs}`,
  read: `${proxyPrefix}${jsonRead}`,
  write: `${proxyPrefix}${jsonWrite}`,
  verify3PC: `${proxyPrefix}${jsonVerify3PC}`,
  newId: `${proxyPrefix}${jsonNewId}`,
  createSeed: `${proxyPrefix}${jsonSeed}`,
};
export const redirectProxyEndpoints = {
  read: `${proxyPrefix}${redirectEndpoints.read}`,
  write: `${proxyPrefix}${redirectEndpoints.write}`,
};

export const proxyUriParams = {
  returnUrl: 'returnUrl',
  message: 'message',
};
