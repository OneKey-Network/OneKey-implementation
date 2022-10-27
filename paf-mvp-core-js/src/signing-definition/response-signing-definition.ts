import {
  DeleteIdsPrefsResponse,
  GetIdsPrefsResponse,
  GetNewIdResponse,
  PostIdsPrefsResponse,
  Unsigned,
} from '@onekey/core/model';
import { SIGN_SEP, SigningDefinition } from '@onekey/core/signing-definition/signing-definition';

export type ResponseType = GetIdsPrefsResponse | PostIdsPrefsResponse | GetNewIdResponse;

/**
 * Defines how to sign a response with a "body" property.
 * Examples: GetIdsPrefsResponse, PostIdsPrefsResponse, PostIdsPrefsRequest, GetNewIdResponse
 */
export class ResponseSigningDefinition implements SigningDefinition<ResponseType> {
  getSignature(response: ResponseType) {
    return response.signature;
  }

  getSignerDomain(response: ResponseType) {
    return response.sender;
  }

  getInputString(
    response: Unsigned<GetIdsPrefsResponse | PostIdsPrefsResponse | GetNewIdResponse | DeleteIdsPrefsResponse>
  ): string {
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
