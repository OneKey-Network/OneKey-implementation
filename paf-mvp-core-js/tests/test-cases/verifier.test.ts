import { PublicKey } from '@core/crypto/keys';
import { FooSigningDefinition, FooType } from '../helpers/crypto.helper';
import { PublicKeyProvider, Verifier } from '@core/crypto/verifier';

describe('Verifier', () => {
  test('should verify based on definition', async () => {
    const mockPublicKey: PublicKey = {
      verify: (toVerify: string, signature: string) => signature === `SIGNED[${toVerify}]`,
    };

    const mockPublicKeyProvider: PublicKeyProvider = (domain: string) => {
      if (domain === 'theDomain.com') {
        return Promise.resolve(mockPublicKey);
      }
      throw new Error(`Certificate not found for ${domain}`);
    };

    const mockData: FooType = {
      bar: 'bar',
      foo: 'foo',
      domain: 'theDomain.com',
    };

    const verifier = new Verifier(mockPublicKeyProvider, new FooSigningDefinition());

    const getSignerDomain = jest.spyOn(FooSigningDefinition.prototype, 'getSignerDomain');
    const getInputString = jest.spyOn(FooSigningDefinition.prototype, 'getInputString');
    const getSignature = jest.spyOn(FooSigningDefinition.prototype, 'getSignature');

    const checkCalls = () => {
      expect(getSignerDomain).toHaveBeenCalledTimes(1);
      getSignerDomain.mockClear();
      expect(getInputString).toHaveBeenCalledTimes(1);
      getInputString.mockClear();
      expect(getSignature).toHaveBeenCalledTimes(1);
      getSignature.mockClear();
    };

    expect(await verifier.verifySignature({ ...mockData, signature: 'WRONG_SIGNATURE[foo.bar]' })).toEqual(false);
    checkCalls();
    expect(await verifier.verifySignature({ ...mockData, signature: 'SIGNED[foo_bar]' })).toEqual(false);
    checkCalls();
    expect(await verifier.verifySignature({ ...mockData, signature: 'SIGNED[foo.bar]' })).toEqual(true);
    checkCalls();
  });
});
