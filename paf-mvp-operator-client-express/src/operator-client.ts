import {
  GetIdsPrefsResponse,
  Identifiers,
  IdsAndPreferences,
  Preferences,
  Seed,
  Signature,
  TransactionId,
} from '@core/model/generated-model';
import { CurrentModelVersion, UnsignedSource } from '@core/model/model';
import { privateKeyFromString } from '@core/crypto/keys';
import { PublicKeyStore } from '@core/crypto/key-store';
import { GetIdsPrefsRequestBuilder } from '@core/model/operator-request-builders';
import { SignerImpl } from '@core/crypto/signer';
import {
  IdsAndPreferencesDefinition,
  IdsAndUnsignedPreferences,
  ResponseDefinition,
  SeedSignatureBuilder,
  SeedSignatureContainer,
} from '@core/crypto/signing-definition';
import { ResponseVerifier } from '@core/crypto/verifier';
import { getTimeStampInSec } from '@core/timestamp';
import { Request } from 'express';

// FIXME should probably be moved to core library
export class OperatorClient {
  private readonly getIdsPrefsRequestBuilder: GetIdsPrefsRequestBuilder;
  private readonly prefsSigner: SignerImpl<IdsAndUnsignedPreferences>;
  private readonly seedSigner: SignerImpl<SeedSignatureContainer>;

  constructor(
    protected operatorHost: string,
    private clientHost: string,
    privateKey: string,
    private readonly keyStore: PublicKeyStore,
    private readonly readVerifier = new ResponseVerifier(keyStore.provider, new ResponseDefinition())
  ) {
    this.getIdsPrefsRequestBuilder = new GetIdsPrefsRequestBuilder(operatorHost, clientHost, privateKey);
    this.prefsSigner = new SignerImpl(privateKeyFromString(privateKey), new IdsAndPreferencesDefinition());
    this.seedSigner = new SignerImpl(privateKeyFromString(privateKey), new SeedSignatureBuilder());
  }

  async verifyReadResponse(request: GetIdsPrefsResponse): Promise<boolean> {
    // Signature + timestamp + sender + receiver are valid
    return this.readVerifier.verifySignatureAndContent(request, this.operatorHost, this.clientHost);
  }

  buildPreferences(
    identifiers: Identifiers,
    data: { use_browsing_for_personalization: boolean },
    timestamp = getTimeStampInSec()
  ): Preferences {
    const unsignedPreferences: UnsignedSource<Preferences> = {
      version: '0.1',
      data,
      source: {
        domain: this.clientHost,
        timestamp,
      },
    };

    const { source, ...rest } = unsignedPreferences;

    return {
      ...rest,
      source: {
        ...source,
        signature: this.prefsSigner.sign({ identifiers, preferences: unsignedPreferences }),
      },
    };
  }

  buildSeed(transactionIds: TransactionId[], idsAndPreferences: IdsAndPreferences): Seed {
    const unsigned = this.createUnsignedSeed(transactionIds);
    const signature = this.seedSigner.sign({ seed: unsigned, idsAndPreferences });
    const seed = this.addSignatureToSeed(unsigned, signature);
    return seed;
  }

  getReadRestUrl(req: Request): URL {
    const getIdsPrefsRequestJson = this.getIdsPrefsRequestBuilder.buildRestRequest({ origin: req.header('origin') });
    return this.getIdsPrefsRequestBuilder.getRestUrl(getIdsPrefsRequestJson);
  }

  getReadRedirectUrl(req: Request, returnUrl: URL): URL {
    const getIdsPrefsRequestJson = this.getIdsPrefsRequestBuilder.buildRedirectRequest({
      referer: req.header('referer'),
      returnUrl: returnUrl.toString(),
    });
    return this.getIdsPrefsRequestBuilder.getRedirectUrl(getIdsPrefsRequestJson);
  }

  private createUnsignedSeed(transactionIds: TransactionId[], timestamp = getTimeStampInSec()): UnsignedSource<Seed> {
    return {
      version: CurrentModelVersion,
      transaction_ids: transactionIds,
      publisher: this.clientHost,
      source: {
        domain: this.clientHost,
        timestamp,
      },
    };
  }

  private addSignatureToSeed(unsigned: UnsignedSource<Seed>, signature: Signature): Seed {
    return {
      ...unsigned,
      source: {
        ...unsigned.source,
        signature,
      },
    };
  }
}
