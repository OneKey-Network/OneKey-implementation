import { OperatorNode } from '@operator/operator-node';
import { createRequest, createResponse, MockResponse } from 'node-mocks-http';
import { Response } from 'express';
import { OperatorClient } from '@client/operator-client';
import { GetIdsPrefsResponse, Signature, Timestamp } from '@core/model';
import { id, preferences } from '../fixtures/operator-fixtures';
import { NodeError, NodeErrorType } from '@core/errors';
import { OperatorUtils } from '../utils/operator-utils';

describe('Operator Node', () => {
  let operatorNode: OperatorNode;
  let response: MockResponse<Response>;
  const nextMock = jest.fn();
  const operatorHost = 'example.onekey.network';
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
    operatorNode = OperatorUtils.buildOperator(OperatorUtils.getSuccessfulJsonValidatorMock(), () =>
      Promise.resolve({ verify: () => true })
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
  afterEach(() => {
    nextMock.mockClear();
  });
});
