import { v4 as uuidv4 } from 'uuid';
import { getTimeStampInSec } from '@onekey/core/timestamp';
import { Identifier } from '@onekey/core/model/generated-model';
import { UnsignedSource } from '@onekey/core/model/model';
import { ISigner, Signer } from '@onekey/core/crypto/signer';
import { IdentifierDefinition } from '@onekey/core/crypto/signing-definition';

export class IdBuilder {
  constructor(
    public host: string,
    privateKey: string,
    private readonly idSigner: ISigner<UnsignedSource<Identifier>> = new Signer(privateKey, new IdentifierDefinition())
  ) {}

  async generateNewId(timestamp = getTimeStampInSec()): Promise<Identifier> {
    // Generate new UUID value
    const pseudonymousId = uuidv4();

    return {
      ...(await this.signId(pseudonymousId, timestamp)),
      persisted: false,
    };
  }

  async signId(value: string, timestampInSec = getTimeStampInSec()): Promise<Identifier> {
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
        signature: await this.idSigner.sign(unsignedId),
      },
    };
  }
}
