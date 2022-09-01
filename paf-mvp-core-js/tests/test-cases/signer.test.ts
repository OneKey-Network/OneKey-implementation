import { Signer } from '@core/crypto/signer';
import { PrivateKey } from '@core/crypto/keys';
import { FooSigningDefinition, FooType } from '../helpers/crypto.helper';

describe('Signer', () => {
  test('should sign based on definition', async () => {
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

    const signer = new Signer(mockPrivateKey, new FooSigningDefinition());
    expect(await signer.sign(mockData)).toEqual('SIGNED[foo.bar]');

    expect(getSignerDomain).toHaveBeenCalledTimes(0);
    expect(getInputString).toHaveBeenCalledTimes(1);
    expect(getSignature).toHaveBeenCalledTimes(0);
  });
});
