import { SignerImpl } from '@core/crypto/signer';
import { PrivateKey } from '@core/crypto/keys';
import { FooSigningDefinition, FooType } from '../helpers/crypto.helper';

describe('Signer', () => {
  test('should sign based on definition', () => {
    const mockPrivateKey: PrivateKey = {
      sign: (data: string) => `SIGNED[${data}]`,
    };

    const mockData: FooType = {
      bar: 'bar',
      foo: 'foo',
      domain: 'theDomain.com',
    };

    const getSignerDomain = jest.spyOn(FooSigningDefinition.prototype, 'getSignerDomain');
    const getInputString = jest.spyOn(FooSigningDefinition.prototype, 'getInputString');
    const getSignature = jest.spyOn(FooSigningDefinition.prototype, 'getSignature');

    const signer = new SignerImpl(mockPrivateKey, new FooSigningDefinition());
    expect(signer.sign(mockData)).toEqual('SIGNED[foo.bar]');

    expect(getSignerDomain).toHaveBeenCalledTimes(0);
    expect(getInputString).toHaveBeenCalledTimes(1);
    expect(getSignature).toHaveBeenCalledTimes(0);
  });
});
