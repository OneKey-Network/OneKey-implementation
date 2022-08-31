import { IJsonValidator, JsonValidation } from '@core/validation/json-validator';
import { PublicKeyProvider } from '@core/crypto';
import { OperatorNode, Permission } from '@operator/operator-node';
import { getTimeStampInSec } from '@core/timestamp';
import { Domain, PostIdsPrefsRequest } from '@core/model';
import { createRequest } from 'node-mocks-http';
import { encodeBase64, QSParam } from '@core/query-string';

export class OperatorUtils {
  private static operatorPublicKey = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEEiZIRhGxNdfG4l6LuY2Qfjyf60R0
jmcW7W3x9wvlX4YXqJUQKR2c0lveqVDj4hwO0kTZDuNRUhgxk4irwV3fzw==
-----END PUBLIC KEY-----`;

  private static operatorHost = 'example.onekey.network';

  private static operatorPrivateKey = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgxK7RQm5KP1g62SQn
oyeE+rrDPJzpZxIyCCTHDvd1TRShRANCAAQSJkhGEbE118biXou5jZB+PJ/rRHSO
ZxbtbfH3C+VfhheolRApHZzSW96pUOPiHA7SRNkO41FSGDGTiKvBXd/P
-----END PRIVATE KEY-----`;

  /**
   * Builds an OperatorNode with specified jsonValidator and publicKeyProvider
   * @param jsonValidator
   * @param publicKeyProvider
   * @returns the built OperatorNode
   */
  static buildOperator = (jsonValidator: IJsonValidator, publicKeyProvider: PublicKeyProvider): OperatorNode =>
    new OperatorNode(
      {
        // Name of the OneKey participant
        name: 'Example operator',
        // Current public key
        publicKeys: [
          {
            // Timestamps are expressed in seconds
            startTimestampInSec: getTimeStampInSec(new Date('2022-01-01T10:50:00.000Z')),
            endTimestampInSec: getTimeStampInSec(new Date('2022-12-31T12:00:00.000Z')),
            publicKey: this.operatorPublicKey,
          },
        ],
        // Email address of DPO
        dpoEmailAddress: 'contact@example.onekey.network',
        // URL of a privacy page
        privacyPolicyUrl: new URL('https://example.onekey.network/privacy'),
      },
      // The operator host name to receive requests
      this.operatorHost,
      // Current private key
      this.operatorPrivateKey,
      // List of OneKey client node host names and their corresponding permissions
      {
        'paf.read-write.com': [Permission.READ, Permission.WRITE],
        'paf.read-only.com': [Permission.READ],
        'paf.write-only.com': [Permission.WRITE],
      },
      jsonValidator,
      publicKeyProvider,
      2000
    );

  private static buildStaticJsonValidator = (validationResult: boolean): IJsonValidator => {
    const jsonValidation: JsonValidation = {
      isValid: validationResult,
      value: {},
    };
    return {
      start: jest.fn(),
      validate: jest.fn(() => jsonValidation),
    };
  };

  /**
   * @returns a jsonValidator that always succeed
   */
  static getSuccessfulJsonValidatorMock = (): IJsonValidator => this.buildStaticJsonValidator(true);

  /**
   * @returns a jsonValidator that always fail
   */
  static getUnsuccessfulJsonValidatorMock = (): IJsonValidator => this.buildStaticJsonValidator(false);

  /**
   * @returns a mock postIdsPrefRequest or redirectPostIdsPrefRequest with the specified sender domain
   */
  static generateMockPostIdsPrefRequest(domain: Domain, isRedirect: boolean) {
    const postIdsPrefRequest: PostIdsPrefsRequest = {
      sender: domain,
      receiver: undefined,
      timestamp: undefined,
      signature: undefined,
      body: undefined,
    };
    if (isRedirect) {
      const targetUrl = new URL('https://somedomain.com');
      const queryString = encodeBase64(
        JSON.stringify({ returnUrl: 'https://someurl.com', request: postIdsPrefRequest })
      );
      targetUrl.searchParams.set(QSParam.paf, queryString);
      return createRequest({
        method: 'GET',
        url: targetUrl.toString(),
      });
    } else {
      const payload = JSON.stringify(postIdsPrefRequest);
      const postRequest = createRequest({
        method: 'POST',
      });
      postRequest.body = payload;
      return postRequest;
    }
  }

  /**
   * @returns a mock GetRequest with the specified sender domain
   */
  static generateMockGetRequest(domain: Domain, isRedirect: boolean) {
    const getRequest = {
      sender: domain,
      receiver: undefined,
      timestamp: undefined,
      signature: undefined,
    };
    const targetUrl = new URL('https://somedomain.com');
    const queryString = encodeBase64(
      JSON.stringify(
        isRedirect
          ? {
              returnUrl: 'https://someurl.com',
              request: getRequest,
            }
          : getRequest
      )
    );
    targetUrl.searchParams.set(QSParam.paf, queryString);
    return createRequest({
      method: 'GET',
      url: targetUrl.toString(),
    });
  }
}
