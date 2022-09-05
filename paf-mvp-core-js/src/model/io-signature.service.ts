import { IDSASigner } from '@core/crypto/digital-signature';
import { GetIdsPrefsResponse, IdsPrefsResponse, PostIdsPrefsResponse } from './generated-model';
import { Unsigned } from './model';

const SIGN_SEP = '\u2063';

/**
 * Service for signing requests and response of endpoints
 */
export interface IIO_DSASignService {
  /**
   * Sign Ids-and-preferences response.
   */
  signIdAndPrefsResponse(response: Unsigned<IdsPrefsResponse>): Promise<IdsPrefsResponse>;
}

/**
 * Construct string used for generating the signature of requests and response of endpoints.
 */
export interface IIOSignatureStringBuilder {
  /**
   * Generate the string that must for signing or verifying an Ids-And-Prefs response
   */
  buildStringToSignForIdAndPrefsResponse(response: Unsigned<IdsPrefsResponse>): string;
}

export class IO_DSASignService implements IIO_DSASignService {
  constructor(
    private dsaSigner: IDSASigner,
    private stringBuilder: IIOSignatureStringBuilder = new IOSignatureStringBuilder()
  ) {
    this.dsaSigner = dsaSigner;
    this.stringBuilder = stringBuilder;
  }

  async signIdAndPrefsResponse(response: Unsigned<IdsPrefsResponse>): Promise<IdsPrefsResponse> {
    const stringToSign = this.stringBuilder.buildStringToSignForIdAndPrefsResponse(response);
    const signature = await this.dsaSigner.sign(stringToSign);
    const signedResponse: IdsPrefsResponse = {
      ...response,
      signature,
    };
    return signedResponse;
  }
}

export class IOSignatureStringBuilder implements IIOSignatureStringBuilder {
  buildStringToSignForIdAndPrefsResponse(response: Unsigned<IdsPrefsResponse>): string {
    const dataToSign = [response.sender, response.receiver];

    if ((response as GetIdsPrefsResponse | PostIdsPrefsResponse).body?.preferences) {
      dataToSign.push((response as GetIdsPrefsResponse | PostIdsPrefsResponse).body.preferences.source.signature);
    }

    for (const id of (response as GetIdsPrefsResponse | PostIdsPrefsResponse).body?.identifiers ?? []) {
      dataToSign.push(id.source.signature);
    }

    dataToSign.push(response.timestamp.toString());

    return dataToSign.join(SIGN_SEP);
  }
}
