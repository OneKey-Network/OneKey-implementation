import { Signer } from '@core/crypto/signer';
import { PrivateKey } from '@core/crypto/keys';
import { IdsAndPreferencesDefinition } from '@core/crypto/signing-definition';
import { IdsAndPreferences } from '@core/model/generated-model';

describe('IdsAndPreferencesDefinition', () => {
  test('should sign ids and preferences', () => {
    const mockPrivateKey: PrivateKey = {
      sign: (data: string) => `SIGNED[${data}]`,
    };

    const idsAndPreferences: IdsAndPreferences = {
      identifiers: [
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

    const signer = new Signer(mockPrivateKey, new IdsAndPreferencesDefinition());
    expect(signer.sign(idsAndPreferences)).toEqual(
      'SIGNED[cmp.com\u20631642504560\u2063id-signature\u2063use_browsing_for_personalization\u2063true]'
    );
  });
});
