import { OperatorNode, Permission } from '@operator/operator-node';
import { getTimeStampInSec } from '@core/timestamp';
import { createRequest, createResponse, MockResponse } from 'node-mocks-http';
import { Response } from 'Express';
import { OperatorClient } from '@client/operator-client';
import { GetIdsPrefsResponse, Signature, Timestamp } from '@core/model';

describe('Operator Node', () => {
  let operatorNode: OperatorNode;
  let response: MockResponse<Response>;
  const nextMock = jest.fn();
  const operatorHost = 'example.onekey.network';
  const operatorPublicKey = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEEiZIRhGxNdfG4l6LuY2Qfjyf60R0
jmcW7W3x9wvlX4YXqJUQKR2c0lveqVDj4hwO0kTZDuNRUhgxk4irwV3fzw==
-----END PUBLIC KEY-----`;
  const publicKeyProviderAlwaysSucceeds = () => Promise.resolve({ verify: () => true });
  const client = new OperatorClient(
    operatorHost,
    'paf.example-websiteA.com',
    `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgxrHgVC3uFlEqnqab
cPqLNBFbMbt1tAPsvKy8DBV2m+ChRANCAARSdqvCnSBRmCNv1+xg0tw2t100pXmH
j9Z8xExWHcciqiO3csiy9RCKDWub1mRw3H4gdlWEMz6GyjaxeUaMX3E5
-----END PRIVATE KEY-----`,
    publicKeyProviderAlwaysSucceeds
  );

  /**
   * Do basic assertions on a source
   * @param data
   */
  const basicAssertSignature = (data: { timestamp: Timestamp; signature: Signature }) => {
    expect(Number(data.timestamp)).not.toBeNaN();
    expect(data.signature).not.toBe('');
  };

  beforeEach(() => {
    operatorNode = new OperatorNode(
      {
        // Name of the OneKey participant
        name: 'Example operator',
        // Current public key
        publicKeys: [
          {
            // Timestamps are expressed in seconds
            startTimestampInSec: getTimeStampInSec(new Date('2022-01-01T10:50:00.000Z')),
            endTimestampInSec: getTimeStampInSec(new Date('2022-12-31T12:00:00.000Z')),
            publicKey: operatorPublicKey,
          },
        ],
        // Email address of DPO
        dpoEmailAddress: 'contact@example.onekey.network',
        // URL of a privacy page
        privacyPolicyUrl: new URL('https://example.onekey.network/privacy'),
      },
      // The operator host name to receive requests
      operatorHost,
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
      () => Promise.resolve({ verify: () => true })
    );

    response = createResponse();
  });

  describe('restRead', () => {
    test('no cookie', async () => {
      const clientRequest = createRequest({
        headers: {
          origin: 'www.example-websiteA.com',
        },
      });
      const url = client.getReadResponse(clientRequest);

      const request = createRequest({
        method: 'GET',
        headers: {
          origin: 'www.example-websiteA.com',
        },
        url,
      });

      await operatorNode.restRead(request, response, nextMock);

      expect(response._getStatusCode()).toEqual(200);
      expect(nextMock).toHaveBeenCalledWith();
      // Check data
      const data = response._getJSONData() as GetIdsPrefsResponse;
      basicAssertSignature(data);
      expect(data.body.preferences).toBeUndefined();
      expect(data.body.identifiers).toHaveLength(1);
      const identifier = data.body.identifiers[0];
      basicAssertSignature(identifier.source);
      expect(identifier.source.domain).toEqual(operatorHost);
      expect(identifier.persisted).toEqual(false);
    });
  });

  afterEach(() => {
    nextMock.mockClear();
  });
});
