import { getTimeStampInSec } from '@core/timestamp';
import { OperatorNode, Permission } from '@operator/operator-node';

// This is just an example of a basic operator node configuration
export const operator = new OperatorNode(
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
  'example.onekey.network',
  `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgxK7RQm5KP1g62SQn
oyeE+rrDPJzpZxIyCCTHDvd1TRShRANCAAQSJkhGEbE118biXou5jZB+PJ/rRHSO
ZxbtbfH3C+VfhheolRApHZzSW96pUOPiHA7SRNkO41FSGDGTiKvBXd/P
-----END PRIVATE KEY-----`,
  {
    'paf.example-websiteA.com': [Permission.READ, Permission.WRITE],
    'paf.example-websiteB.com': [Permission.READ, Permission.WRITE],
    'paf.example-websiteC.com': [Permission.READ, Permission.WRITE],
  }
);
