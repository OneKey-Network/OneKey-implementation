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
  GetIdsPrefsResponseValidation,
  GetNewIdResponseValidation,
  PostIdsPrefsResponseValidation,
} from '../crypto/message-validation';
import { getTimeStampInSec } from '../timestamp';
import { setInQueryString } from '../express/utils';
import { PrivateKey, privateKeyFromString } from '@core/crypto/keys';

export abstract class ResponseBuilderWithRedirect<T> {
  protected readonly ecdsaKey: PrivateKey;

  constructor(protected host: string, privateKey: string) {
    this.ecdsaKey = privateKeyFromString(privateKey);
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

export class GetIdsPrefsResponseBuilder extends ResponseBuilderWithRedirect<GetIdsPrefsResponse> {
  private readonly signer = new GetIdsPrefsResponseValidation();

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

export class PostIdsPrefsResponseBuilder extends ResponseBuilderWithRedirect<PostIdsPrefsResponse> {
  private readonly signer = new PostIdsPrefsResponseValidation();

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

export class GetNewIdResponseBuilder {
  private readonly signer = new GetNewIdResponseValidation();
  private readonly ecdsaKey: PrivateKey;

  constructor(protected host: string, privateKey: string) {
    this.ecdsaKey = privateKeyFromString(privateKey);
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

export class Get3PCResponseBuilder {
  buildResponse(cookieFound: Test3Pc | undefined): Get3PcResponse | Error {
    return cookieFound ? { '3pc': cookieFound } : { message: '3PC not supported' };
  }
}
