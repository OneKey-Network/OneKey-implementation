import { GetIdsPrefsResponse, Identifiers, IdsAndPreferences, Preferences } from '@core/model/generated-model';
import { UnsignedData } from '@core/model/model';
import { privateKeyFromString } from '@core/crypto/keys';
import { PublicKeyStore } from '@core/express/key-store';
import { GetIdsPrefsRequestBuilder } from '@core/model/operator-request-builders';
import { Signer } from '@core/crypto/signer';
import {
  MessageWithBodyDefinition,
  IdsAndPreferencesDefinition,
  IdsAndUnsignedPreferences,
} from '@core/crypto/signing-definition';
import { MessageVerifier } from '@core/crypto/verifier';

// FIXME should probably be moved to core library
export class OperatorClient {
  private readonly getIdsPrefsRequestBuilder: GetIdsPrefsRequestBuilder;
  private readonly prefsSigner: Signer<IdsAndPreferences, IdsAndUnsignedPreferences>;

  constructor(
    protected operatorHost: string,
    private clientHost: string,
    privateKey: string,
    private readonly keyStore: PublicKeyStore,
    private readonly readVerifier = new MessageVerifier(keyStore.provider, new MessageWithBodyDefinition())
  ) {
    this.getIdsPrefsRequestBuilder = new GetIdsPrefsRequestBuilder(operatorHost, clientHost, privateKey);
    this.prefsSigner = new Signer(privateKeyFromString(privateKey), new IdsAndPreferencesDefinition());
  }

  async verifyReadResponse(message: GetIdsPrefsResponse): Promise<boolean> {
    // Signature + timestamp + sender + receiver are valid
    return this.readVerifier.verifySignatureAndContent(message, this.operatorHost, this.clientHost);
  }

  buildPreferences(
    identifiers: Identifiers,
    data: { use_browsing_for_personalization: boolean },
    timestamp = new Date().getTime()
  ): Preferences {
    const unsignedPreferences: UnsignedData<Preferences> = {
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

  getReadRestUrl(): URL {
    const getIdsPrefsRequestJson = this.getIdsPrefsRequestBuilder.buildRequest();
    return this.getIdsPrefsRequestBuilder.getRestUrl(getIdsPrefsRequestJson);
  }

  getReadRedirectUrl(returnUrl: URL): URL {
    const getIdsPrefsRequestJson = this.getIdsPrefsRequestBuilder.toRedirectRequest(
      this.getIdsPrefsRequestBuilder.buildRequest(),
      returnUrl
    );
    return this.getIdsPrefsRequestBuilder.getRedirectUrl(getIdsPrefsRequestJson);
  }
}
