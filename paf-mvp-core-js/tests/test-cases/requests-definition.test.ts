import {
  RedirectContext,
  RequestWithBodyDefinition,
  RequestWithoutBodyDefinition,
  RestContext,
} from '@onekey/core/crypto/signing-definition';
import { GetNewIdRequest, PostIdsPrefsRequest } from '@onekey/core/model/generated-model';

describe('RequestWithoutBodyDefinition', () => {
  const request: GetNewIdRequest = {
    sender: 'sender.com',
    receiver: 'receiver.com',
    timestamp: 1642504380,
    signature: 'signature_is_here',
  };

  const definition = new RequestWithoutBodyDefinition();

  test('should extract appropriate data', () => {
    const restContext: RestContext = {
      origin: 'www.sender.com/some-origin-page',
    };

    const redirectContext: RedirectContext = {
      returnUrl: 'wwww.sender.com/the-return-page',
      referer: 'www.sender.com/some-referer-page',
    };

    const requestAndRestContext = { request, context: restContext };
    const requestAndRedirectContext = { request, context: redirectContext };

    expect(definition.getInputString(requestAndRestContext)).toEqual(
      'sender.com\u2063receiver.com\u20631642504380\u2063www.sender.com/some-origin-page'
    );
    expect(definition.getInputString(requestAndRedirectContext)).toEqual(
      'sender.com\u2063receiver.com\u20631642504380\u2063www.sender.com/some-referer-page\u2063wwww.sender.com/the-return-page'
    );

    [requestAndRestContext, requestAndRedirectContext].forEach((request) => {
      expect(definition.getSignature(request)).toEqual('signature_is_here');
      expect(definition.getSignerDomain(request)).toEqual('sender.com');
    });
  });

  test('should throw on missing context', () => {
    expect(() => definition.getInputString({ request, context: { origin: null } })).toThrow();
    expect(() => definition.getInputString({ request, context: { referer: null, returnUrl: 'something' } })).toThrow();
  });
});

describe('RequestWithBodyDefinition', () => {
  const request: PostIdsPrefsRequest = {
    sender: 'sender.com',
    receiver: 'receiver.com',
    timestamp: 1642504380,
    signature: 'signature_is_here',
    body: {
      identifiers: [
        {
          version: '0.1',
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          type: 'another_type_of_id',
          value: 'abcdefgh',
          source: {
            domain: 'operator.paf-operation-domain.io',
            timestamp: 1642504380,
            signature: 'another_id-signature',
          },
        },
        {
          version: '0.1',
          type: 'paf_browser_id',
          value: '7435313e-caee-4889-8ad7-0acd0114ae3c',
          source: {
            domain: 'operator.paf-operation-domain.io',
            timestamp: 1642504380,
            signature: 'id-signature',
          },
        },
      ],
      preferences: {
        version: '0.1',
        data: {
          use_browsing_for_personalization: true,
        },
        source: {
          domain: 'cmp.com',
          timestamp: 1642504560,
          signature: 'prefs-signature',
        },
      },
    },
  };

  const definition = new RequestWithBodyDefinition();

  test('should extract appropriate data', () => {
    const restContext: RestContext = {
      origin: 'www.sender.com/some-origin-page',
    };

    const redirectContext: RedirectContext = {
      returnUrl: 'wwww.sender.com/the-return-page',
      referer: 'www.sender.com/some-referer-page',
    };

    const requestAndRestContext = { request, context: restContext };
    const requestAndRedirectContext = { request, context: redirectContext };

    expect(definition.getInputString(requestAndRestContext)).toEqual(
      'sender.com\u2063receiver.com\u2063prefs-signature\u2063another_id-signature\u2063id-signature\u20631642504380\u2063www.sender.com/some-origin-page'
    );
    expect(definition.getInputString(requestAndRedirectContext)).toEqual(
      'sender.com\u2063receiver.com\u2063prefs-signature\u2063another_id-signature\u2063id-signature\u20631642504380\u2063www.sender.com/some-referer-page\u2063wwww.sender.com/the-return-page'
    );

    [requestAndRestContext, requestAndRedirectContext].forEach((request) => {
      expect(definition.getSignature(request)).toEqual('signature_is_here');
      expect(definition.getSignerDomain(request)).toEqual('sender.com');
    });
  });

  test('should throw on missing context', () => {
    expect(() => definition.getInputString({ request, context: { origin: null } })).toThrow();
    expect(() => definition.getInputString({ request, context: { referer: null, returnUrl: 'something' } })).toThrow();
  });
});
