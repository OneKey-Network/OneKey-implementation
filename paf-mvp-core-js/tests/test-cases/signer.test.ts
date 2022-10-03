import { Signer } from '@onekey/core/crypto/signer';
import { FooSigningDefinition, FooType, mockBuilder } from '../helpers/crypto.helper';

describe('Signer', () => {
  test('should sign based on definition', async () => {
    const mockData: FooType = {
      bar: 'bar',
      foo: 'foo',
      domain: 'theDomain.com',
    };

    const getSignerDomain = jest.spyOn(FooSigningDefinition.prototype, 'getSignerDomain');
    const getInputString = jest.spyOn(FooSigningDefinition.prototype, 'getInputString');
    const getSignature = jest.spyOn(FooSigningDefinition.prototype, 'getSignature');

    mockBuilder.buildSigner.mockImplementation(() => ({ sign: (data: string) => Promise.resolve(`SIGNED[${data}]`) }));

    const signer = new Signer('', new FooSigningDefinition(), mockBuilder);

    expect(await signer.sign(mockData)).toEqual('SIGNED[foo.bar]');

    expect(getSignerDomain).toHaveBeenCalledTimes(0);
    expect(getInputString).toHaveBeenCalledTimes(1);
    expect(getSignature).toHaveBeenCalledTimes(0);
  });
});
