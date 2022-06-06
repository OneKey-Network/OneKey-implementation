import { v4 as uuidv4 } from 'uuid';
import { Identifier, PostIdsPrefsRequest } from '@core/model/generated-model';
import { UnsignedSource } from '@core/model/model';
import { getTimeStampInSec } from '@core/timestamp';
import { privateKeyFromString } from '@core/crypto/keys';
import { PublicKeyStore } from '@core/crypto/key-store';
import { Signer } from '@core/crypto/signer';
import {
  IdentifierDefinition,
  RequestWithBodyDefinition,
  RequestWithoutBodyDefinition,
} from '@core/crypto/signing-definition';
import { RequestVerifier } from '@core/crypto/verifier';

export const messageTTLSeconds = 30;

// FIXME should probably be moved to core library
export class OperatorApi {
  constructor(
    public host: string,
    privateKey: string,
    keyStore: PublicKeyStore,
    private readonly idSigner = new Signer(privateKeyFromString(privateKey), new IdentifierDefinition()),
    public readonly postIdsPrefsRequestVerifier = new RequestVerifier<PostIdsPrefsRequest>(
      keyStore.provider,
      new RequestWithBodyDefinition() // POST ids and prefs has body property
    ),
    public readonly getIdsPrefsRequestVerifier = new RequestVerifier(
      keyStore.provider,
      new RequestWithoutBodyDefinition()
    ),
    public readonly getNewIdRequestVerifier = new RequestVerifier(keyStore.provider, new RequestWithoutBodyDefinition())
  ) {}

  generateNewId(timestamp = getTimeStampInSec()): Identifier {
    // Generate new UUID value
    const pseudonymousId = uuidv4();

    return {
      ...this.signId(pseudonymousId, timestamp),
      persisted: false,
    };
  }

  signId(value: string, timestampInSec = getTimeStampInSec()): Identifier {
    const unsignedId: UnsignedSource<Identifier> = {
      version: '0.1',
      type: 'paf_browser_id',
      value,
      source: {
        domain: this.host,
        timestamp: timestampInSec,
      },
    };
    const { source, ...rest } = unsignedId;

    return {
      ...rest,
      source: {
        ...source,
        signature: this.idSigner.sign(unsignedId),
      },
    };
  }
}
