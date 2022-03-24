import {
  Error,
  Get3PcResponse,
  GetIdsPrefsResponse,
  GetNewIdResponse,
  Identifier,
  IdsAndOptionalPreferences,
  IdsAndPreferences,
  PostIdsPrefsResponse,
  Test3Pc,
} from './generated-model';
import { UnsignedMessage } from './model';
import {
  GetIdsPrefsResponseSigner,
  GetNewIdResponseSigner,
  PostIdsPrefsResponseSigner,
} from '../crypto/message-signature';
import { jsonOperatorEndpoints, redirectEndpoints } from '../endpoints';
import { getTimeStampInSec } from '../timestamp';
import { setInQueryString } from '../express/utils';
import { RestResponseBuilder } from '@core/model/response-builders';

export abstract class RestAndRedirectResponseBuilder<T> extends RestResponseBuilder<T> {
  constructor(host: string, privateKey: string, restEndpoint: string, protected redirectEndpoint: string) {
    super(host, privateKey, restEndpoint);
  }

  getRedirectUrl(returnUrl: URL, redirectResponse: { code: number; response?: T; error?: Error }): URL {
    if (redirectResponse) {
      setInQueryString(returnUrl, redirectResponse);
    }

    return returnUrl;
  }

  toRedirectResponse(response: T, code: number) {
    return {
      code,
      response,
    };
  }
}

export class GetIdsPrefsResponseBuilder extends RestAndRedirectResponseBuilder<GetIdsPrefsResponse> {
  private readonly signer = new GetIdsPrefsResponseSigner();

  constructor(host: string, privateKey: string) {
    super(host, privateKey, jsonOperatorEndpoints.read, redirectEndpoints.read);
  }

  buildResponse(
    receiver: string,
    { identifiers, preferences }: IdsAndOptionalPreferences,
    timestampInSec = getTimeStampInSec()
  ): GetIdsPrefsResponse {
    const data: UnsignedMessage<GetIdsPrefsResponse> = {
      body: {
        identifiers,
        preferences,
      },
      sender: this.host,
      receiver,
      timestamp: timestampInSec,
    };

    return {
      ...data,
      signature: this.signer.sign(this.ecdsaKey, data),
    };
  }
}

export class PostIdsPrefsResponseBuilder extends RestAndRedirectResponseBuilder<PostIdsPrefsResponse> {
  private readonly signer = new PostIdsPrefsResponseSigner();

  constructor(host: string, privateKey: string) {
    super(host, privateKey, jsonOperatorEndpoints.read, redirectEndpoints.read);
  }

  buildResponse(
    receiver: string,
    { identifiers, preferences }: IdsAndPreferences,
    timestampInSec = getTimeStampInSec()
  ): PostIdsPrefsResponse {
    const data: UnsignedMessage<PostIdsPrefsResponse> = {
      body: {
        identifiers,
        preferences,
      },
      sender: this.host,
      receiver,
      timestamp: timestampInSec,
    };

    return {
      ...data,
      signature: this.signer.sign(this.ecdsaKey, data),
    };
  }
}

export class GetNewIdResponseBuilder extends RestResponseBuilder<GetNewIdResponse> {
  private readonly signer = new GetNewIdResponseSigner();

  constructor(host: string, privateKey: string) {
    super(host, privateKey, jsonOperatorEndpoints.newId);
  }

  buildResponse(receiver: string, newId: Identifier, timestampInSec = getTimeStampInSec()): GetNewIdResponse {
    const data: UnsignedMessage<GetNewIdResponse> = {
      body: {
        identifiers: [newId],
      },
      sender: this.host,
      receiver,
      timestamp: timestampInSec,
    };

    return {
      ...data,
      signature: this.signer.sign(this.ecdsaKey, data),
    };
  }
}

export class Get3PCResponseBuilder extends RestResponseBuilder<undefined> {
  // FIXME remove host and private key from constructor
  constructor(host: string, privateKey: string) {
    super(host, privateKey, jsonOperatorEndpoints.verify3PC);
  }

  buildResponse(cookieFound: Test3Pc | undefined): Get3PcResponse | Error {
    return cookieFound ? { '3pc': cookieFound } : { message: '3PC not supported' };
  }
}
