import { IdsAndPreferences } from '@onekey/core/model/generated-model';
import { IdsAndPrefsSigningDefinition } from '@onekey/core/signing-definition/ids-prefs-signing-definition';

describe('IdsAndPreferencesDefinition', () => {
  test('should extract appropriate data', () => {
    const idsAndPreferences: IdsAndPreferences = {
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
    };

    const definition = new IdsAndPrefsSigningDefinition();

    expect(definition.getInputString(idsAndPreferences)).toEqual(
      'cmp.com\u20631642504560\u2063id-signature\u2063use_browsing_for_personalization\u2063true'
    );
    expect(definition.getSignature(idsAndPreferences)).toEqual('prefs-signature');
    expect(definition.getSignerDomain(idsAndPreferences)).toEqual('cmp.com');
    expect(definition.getPafId(idsAndPreferences).value).toEqual('7435313e-caee-4889-8ad7-0acd0114ae3c');
  });
});
