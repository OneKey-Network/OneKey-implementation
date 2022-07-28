import { PublicKey } from '@core/crypto/keys';
import { FooSigningDefinition, FooType } from '../helpers/crypto.helper';
import { Verifier } from '@core/crypto/verifier';
import { PublicKeyProvider } from '@core/crypto';
import SpyInstance = jest.SpyInstance;

describe('Verifier', () => {
  const publicKeyA: PublicKey = {
    verify: (toVerify: string, signature: string) => signature === `SIGNED[${toVerify}]`,
  };
  const publicKeyB: PublicKey = {
    verify: (toVerify: string, signature: string) => signature === `SIGNED_B[${toVerify}]`,
  };

  const mockPublicKeyProvider: PublicKeyProvider = (domain: string) => {
    if (domain === 'domainA.com') {
      return Promise.resolve(publicKeyA);
    } else if (domain === 'domainB.com') {
      return Promise.resolve(publicKeyB);
    }
    throw new Error(`Certificate not found for ${domain}`);
  };

  const mockData: FooType = {
    bar: 'bar',
    foo: 'foo',
    domain: 'domainA.com',
    signature: 'SIGNED[foo.bar]',
  };

  const verifier = new Verifier(mockPublicKeyProvider, new FooSigningDefinition());

  const spies: { [name in keyof FooSigningDefinition]?: SpyInstance } = {
    getSignerDomain: jest.spyOn(FooSigningDefinition.prototype, 'getSignerDomain'),
    getInputString: jest.spyOn(FooSigningDefinition.prototype, 'getInputString'),
    getSignature: jest.spyOn(FooSigningDefinition.prototype, 'getSignature'),
  };

  const verifyCalls = (calls: { [name in keyof FooSigningDefinition]?: number }) => {
    Object.keys(calls).forEach((key) => {
      const mock = spies[key];
      expect(mock).toHaveBeenCalledTimes(calls[key]);
      mock.mockClear();
    });
  };

  const cases = [
    {
      data: { ...mockData, signature: 'WRONG_SIGNATURE[foo.bar]' },
      expectedVerification: false,
    },
    {
      data: { ...mockData, signature: 'SIGNED[foo_bar]' },
      expectedVerification: false,
    },
    {
      data: mockData,
      expectedVerification: true,
    },
    {
      data: { ...mockData, domain: 'domainB.com' },
      expectedVerification: false,
    },
    {
      data: { ...mockData, domain: 'domainB.com', signature: 'SIGNED_B[foo.bar]' },
      expectedVerification: true,
    },
  ];

  test.each(cases)('should verify "$data" as $expectedVerification', async ({ data, expectedVerification }) => {
    expect(await verifier.verifySignature(data)).toEqual(expectedVerification);

    verifyCalls({
      getSignerDomain: 1,
      getInputString: 1,
      getSignature: 1,
    });
  });

  const exceptionCases = [
    {
      data: { ...mockData, domain: 'anotherDomain.com' },
    },
  ];

  test.each(exceptionCases)('should throw exception for domain "$data.domain"', async ({ data }) => {
    await expect(verifier.verifySignature(data)).rejects.toThrow();

    verifyCalls({
      getSignerDomain: 1,
      // Notice only first method is called
      getInputString: 0,
      getSignature: 0,
    });
  });
});
