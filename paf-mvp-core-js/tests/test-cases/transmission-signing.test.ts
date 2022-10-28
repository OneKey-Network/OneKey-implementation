import { Seed, TransmissionResult } from '@onekey/core/model/generated-model';
import { PublicKeyProvider, Verifier } from '@onekey/core/crypto';
import { TransmissionResultSigningDefinition } from '@onekey/core/signing-definition/transmission-result-signing-definition';

describe('Transmission verifier', () => {
  test('should verify production transmission', () => {
    const seed: Seed = {
      version: '0.1',
      transaction_ids: ['b5debc31-5d0d-4439-964e-7a42e2450132', 'ad4ba2e2-6719-48fd-9be6-2409c6f2656b'],
      publisher: 'cmp.pafdemopublisher.com',
      source: {
        timestamp: 1666871319,
        domain: 'cmp.pafdemopublisher.com',
        signature: 'MEUCIQCfgGPbe0OFRrc15a3sAupiupbX+V9RD512VSWPLq8czgIgB2/WH5+24ghZ0iTJpidxc7+7WQ9hgFKH1pYCrZG87Hc=',
      },
    };

    const transmissionResult: TransmissionResult = {
      version: '0.1',
      receiver: 'onekey.criteo.com',
      contents: [
        {
          content_id: 'c8462bdb-6364-4702-9fbe-ba85d655d169',
          transaction_id: 'b5debc31-5d0d-4439-964e-7a42e2450132',
        },
        {
          content_id: '5763ac91-7574-449f-af32-aae26b9383f0',
          transaction_id: 'ad4ba2e2-6719-48fd-9be6-2409c6f2656b',
        },
      ],
      status: 'success',
      details: '',
      source: {
        timestamp: 1666871320,
        domain: 'onekey.criteo.com',
        signature: 'MEQCIC7QTTVErnq7OeAQ4mMDsVCyyIAaZ2KqF5vojg8s3XxGAiAOG8Vp5dhdML8L6i+he0BGRkaAlmNpYuG1Iz5BfP6nOw==',
      },
    };

    const mockPublicKeyProvider: PublicKeyProvider = () =>
      Promise.resolve(
        '-----BEGIN PUBLIC KEY-----\\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEniFl5gIcLPCAssWjF3ABDtL+YtMU\\nYtc2QYrv4uR3IuIqMHa2I2wEdmcApsU48W1NHx4pkYewI52eUE1PhLFoAw==\\n-----END PUBLIC KEY-----'
      );

    const verifier = new Verifier(mockPublicKeyProvider, new TransmissionResultSigningDefinition());

    expect(verifier.verifySignature({ seed, transmissionResult })).toBeTruthy();
  });
});
