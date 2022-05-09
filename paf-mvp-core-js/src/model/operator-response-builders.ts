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
import { getTimeStampInSec } from '../timestamp';
import { setInQueryString } from '../express/utils';
import { privateKeyFromString } from '@core/crypto/keys';
import { RequestWithBodyDefinition, ResponseDefinition } from '@core/crypto/signing-definition';
import { Signer } from '@core/crypto/signer';

export abstract class ResponseBuilderWithRedirect<T> {
  protected constructor(protected host: string) {}

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
  constructor(
    host: string,
    privateKey: string,
    private readonly signer = new Signer(privateKeyFromString(privateKey), new ResponseDefinition())
  ) {
    super(host);
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
      signature: this.signer.sign(data),
    };
  }
}

export class PostIdsPrefsResponseBuilder extends ResponseBuilderWithRedirect<PostIdsPrefsResponse> {
  constructor(
    host: string,
    privateKey: string,
    private readonly signer = new Signer(privateKeyFromString(privateKey), new ResponseDefinition())
  ) {
    super(host);
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
      signature: this.signer.sign(data),
    };
  }
}

export class GetNewIdResponseBuilder {
  constructor(
    protected host: string,
    privateKey: string,
    private readonly signer = new Signer(privateKeyFromString(privateKey), new ResponseDefinition())
  ) {}

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
      signature: this.signer.sign(data),
    };
  }
}

export class Get3PCResponseBuilder {
  buildResponse(cookieFound: Test3Pc | undefined): Get3PcResponse | Error {
    return cookieFound ? { '3pc': cookieFound } : { message: '3PC not supported' };
  }
}
