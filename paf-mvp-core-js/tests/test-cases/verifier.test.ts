import { FooSigningDefinition, FooType } from '../helpers/crypto.helper';
import { Verifier } from '@core/crypto/verifier';
import { PublicKeyProvider } from '@core/crypto';
import { UnableToIdentifySignerError } from '@core/express/errors';
import SpyInstance = jest.SpyInstance;

describe('Verifier', () => {
  const publicKeyA = 'A';
  const publicKeyB = 'B';

  const mockPublicKeyProvider: PublicKeyProvider = (domain: string) => {
    if (domain === 'domainA.com') {
      return Promise.resolve(publicKeyA);
    } else if (domain === 'domainB.com') {
      return Promise.resolve(publicKeyB);
    }
    throw new UnableToIdentifySignerError(`No valid key found for ${domain}`);
  };

  const mockData: FooType = {
    bar: 'bar',
    foo: 'foo',
    domain: 'domainA.com',
    signature: 'SIGNEDA[foo.bar]',
  };

  const verifier = new Verifier(mockPublicKeyProvider, new FooSigningDefinition());

  jest.spyOn(verifier, 'publicKeyFromString').mockImplementation((key) => ({
    verify: (toVerify: string, signature: string) => signature === `SIGNED${key}[${toVerify}]`,
  }));

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
      data: { ...mockData, domain: 'domainB.com', signature: 'SIGNEDB[foo.bar]' },
      expectedVerification: true,
    },
  ];

  test.each(cases)('should verify "$data" as $expectedVerification', async ({ data, expectedVerification }) => {
    expect((await verifier.verifySignature(data)).isValid).toEqual(expectedVerification);
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

  test.each(exceptionCases)('should return UnableToIdentifySignerError for domain "$data.domain"', async ({ data }) => {
    const validationResult = await verifier.verifySignature(data);
    expect(validationResult.isValid).toEqual(false);
    expect(validationResult.errors[0]).toBeInstanceOf(UnableToIdentifySignerError);
    verifyCalls({
      getSignerDomain: 1,
      // Notice only first method is called
      getInputString: 0,
      getSignature: 0,
    });
  });
});
