import { getTimeStampInSec } from '@core/timestamp';
import { JsonValidator } from '@core/validation/json-validator';
import { OperatorNode, Permission } from '@operator/operator-node';
import { PublicKeyStore } from '@core/crypto';

// This is just an example of a basic operator node configuration
export const operator = new OperatorNode(
  // Identity information: mandatory for any OneKey interaction
  {
    // Name of the OneKey participant
    name: 'Example operator',
    // Current public key
    publicKeys: [
      {
        // Timestamps are expressed in seconds
        startTimestampInSec: getTimeStampInSec(new Date('2022-01-01T10:50:00.000Z')),
        endTimestampInSec: getTimeStampInSec(new Date('2022-12-31T12:00:00.000Z')),
        publicKey: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEEiZIRhGxNdfG4l6LuY2Qfjyf60R0
jmcW7W3x9wvlX4YXqJUQKR2c0lveqVDj4hwO0kTZDuNRUhgxk4irwV3fzw==
-----END PUBLIC KEY-----`,
      },
    ],
    // Email address of DPO
    dpoEmailAddress: 'contact@example.onekey.network',
    // URL of a privacy page
    privacyPolicyUrl: new URL('https://example.onekey.network/privacy'),
  },
  // The operator host name to receive requests
  'example.onekey.network',
  // Current private key
  `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgxK7RQm5KP1g62SQn
oyeE+rrDPJzpZxIyCCTHDvd1TRShRANCAAQSJkhGEbE118biXou5jZB+PJ/rRHSO
ZxbtbfH3C+VfhheolRApHZzSW96pUOPiHA7SRNkO41FSGDGTiKvBXd/P
-----END PRIVATE KEY-----`,
  // List of OneKey client node host names and their corresponding permissions
  {
    'paf.example-websiteA.com': [Permission.READ, Permission.WRITE],
    'paf.example-websiteB.com': [Permission.READ, Permission.WRITE],
    'paf.example-websiteC.com': [Permission.READ, Permission.WRITE],
  },
  JsonValidator.default(),
  new PublicKeyStore().provider,
  2000
);

/* await */ operator.start();
