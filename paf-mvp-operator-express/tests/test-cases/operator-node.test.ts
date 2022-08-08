import { OperatorNode, Permission } from '@operator/operator-node';
import { getTimeStampInSec } from '@core/timestamp';
import { createRequest, createResponse, MockResponse } from 'node-mocks-http';
import { Response } from 'express';
import { OperatorClient } from '@client/operator-client';
import { GetIdsPrefsResponse, Signature, Timestamp } from '@core/model';
import { id, preferences } from '../fixtures/operator-fixtures';
import { OperatorError, OperatorErrorType } from '@core/errors';

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
    'paf.read-write.com',
    `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgxrHgVC3uFlEqnqab
cPqLNBFbMbt1tAPsvKy8DBV2m+ChRANCAARSdqvCnSBRmCNv1+xg0tw2t100pXmH
j9Z8xExWHcciqiO3csiy9RCKDWub1mRw3H4gdlWEMz6GyjaxeUaMX3E5
-----END PRIVATE KEY-----`,
    publicKeyProviderAlwaysSucceeds
  );
  const existingPafCookies = {
    paf_identifiers: JSON.stringify([id]),
    paf_preferences: JSON.stringify(preferences),
  };

  /**
   * Request used by the operator client, to build operator requests
   */
  const clientRequest = createRequest({
    headers: {
      origin: 'www.read-write.com',
    },
  });

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
        'paf.read-write.com': [Permission.READ, Permission.WRITE],
        'paf.read-only.com': [Permission.READ],
        'paf.write-only.com': [Permission.WRITE],
      },
      () => Promise.resolve({ verify: () => true })
    );
    response = createResponse();
  });
  describe('restRead', () => {
    const url = client.getReadResponse(clientRequest);

    test('should return new ID for unknown user', async () => {
      const request = createRequest({
        method: 'GET',
        headers: {
          origin: 'www.read-write.com',
        },
        url,
      });

      await operatorNode.restReadIdsAndPreferences(request, response, nextMock);

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

      // 3PC test cookie
      expect(response.cookies['paf_test_3pc'].value).not.toBe('');
    });
    test('should return existing cookies for known user', async () => {
      const request = createRequest({
        method: 'GET',
        headers: {
          origin: 'www.read-write.com',
        },
        cookies: existingPafCookies,
        url,
      });

      await operatorNode.restReadIdsAndPreferences(request, response, nextMock);

      expect(response._getStatusCode()).toEqual(200);
      expect(nextMock).toHaveBeenCalledWith();
      // Check data
      const data = response._getJSONData() as GetIdsPrefsResponse;
      basicAssertSignature(data);
      expect(data.body.preferences).toEqual(preferences);
      expect(data.body.identifiers).toEqual([id]);

      // 3PC test cookie
      expect(response.cookies['paf_test_3pc'].value).not.toBe('');
    });
  });

  describe('permissions', () => {
    const unauthorizedClient = new OperatorClient(
      operatorHost,
      'paf.unauthorized.com',
      `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgxrHgVC3uFlEqnqab
cPqLNBFbMbt1tAPsvKy8DBV2m+ChRANCAARSdqvCnSBRmCNv1+xg0tw2t100pXmH
j9Z8xExWHcciqiO3csiy9RCKDWub1mRw3H4gdlWEMz6GyjaxeUaMX3E5
-----END PRIVATE KEY-----`,
      publicKeyProviderAlwaysSucceeds
    );
    const readOnlyClient = new OperatorClient(
      operatorHost,
      'paf.read-only.com',
      `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgxrHgVC3uFlEqnqab
cPqLNBFbMbt1tAPsvKy8DBV2m+ChRANCAARSdqvCnSBRmCNv1+xg0tw2t100pXmH
j9Z8xExWHcciqiO3csiy9RCKDWub1mRw3H4gdlWEMz6GyjaxeUaMX3E5
-----END PRIVATE KEY-----`,
      publicKeyProviderAlwaysSucceeds
    );
    const writeOnlyClient = new OperatorClient(
      operatorHost,
      'paf.write-only.com',
      `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgxrHgVC3uFlEqnqab
cPqLNBFbMbt1tAPsvKy8DBV2m+ChRANCAARSdqvCnSBRmCNv1+xg0tw2t100pXmH
j9Z8xExWHcciqiO3csiy9RCKDWub1mRw3H4gdlWEMz6GyjaxeUaMX3E5
-----END PRIVATE KEY-----`,
      publicKeyProviderAlwaysSucceeds
    );
    const cases = [
      {
        client: unauthorizedClient,
        name: 'unauthorized',
        authorized: false,
      },
      {
        client: readOnlyClient,
        name: 'read-only',
        authorized: true,
      },
      {
        client: writeOnlyClient,
        name: 'write-only',
        authorized: false,
      },
    ];

    test.each(cases)('$name client should be allowed to read: $authorized', async ({ client, authorized, name }) => {
      const url = client.getReadResponse(clientRequest);
      const request = createRequest({
        method: 'GET',
        headers: {
          origin: `www.${name}.com`, // Doesn't really matter
        },
        cookies: existingPafCookies,
        url,
      });

      await operatorNode.restReadIdsAndPreferences(request, response, nextMock);

      // TODO later these errors will be more specific
      const error: OperatorError = {
        type: OperatorErrorType.UNKNOWN_ERROR,
        details: '',
      };

      if (authorized) {
        expect(response._getStatusCode()).toEqual(200);
        expect(nextMock).toHaveBeenCalledWith();
        const data = response._getJSONData() as GetIdsPrefsResponse;
        expect(data.body.identifiers).toHaveLength(1);
      } else {
        expect(response._getStatusCode()).toEqual(400);
        expect(nextMock).toHaveBeenCalledWith(error);

        const data = response._getJSONData() as OperatorError;
        expect(data).toEqual(error);
      }
    });
  });

  afterEach(() => {
    nextMock.mockClear();
  });
});
