import {
  DeleteIdsPrefsResponse,
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
import { Unsigned } from './model';
import { getTimeStampInSec } from '../timestamp';
import { setInQueryString } from '../express/utils';
import { ResponseDefinition } from '@core/crypto/signing-definition';
import { Signer } from '@core/crypto/signer';
import { IIO_DSASignService } from './io-signature.service';

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
  constructor(host: string, private readonly signer: IIO_DSASignService) {
    super(host);
  }

  async buildResponse(
    receiver: string,
    { identifiers, preferences }: IdsAndOptionalPreferences,
    timestampInSec = getTimeStampInSec()
  ): Promise<GetIdsPrefsResponse> {
    const request: Unsigned<GetIdsPrefsResponse> = {
      body: {
        identifiers,
        preferences,
      },
      sender: this.host,
      receiver,
      timestamp: timestampInSec,
    };

    return this.signer.signIdAndPrefsResponse(request);
  }
}

export class PostIdsPrefsResponseBuilder extends ResponseBuilderWithRedirect<PostIdsPrefsResponse> {
  constructor(
    host: string,
    privateKey: string,
    private readonly signer = new Signer(privateKey, new ResponseDefinition())
  ) {
    super(host);
  }

  async buildResponse(
    receiver: string,
    { identifiers, preferences }: IdsAndPreferences,
    timestampInSec = getTimeStampInSec()
  ): Promise<PostIdsPrefsResponse> {
    const request: Unsigned<PostIdsPrefsResponse> = {
      body: {
        identifiers,
        preferences,
      },
      sender: this.host,
      receiver,
      timestamp: timestampInSec,
    };

    return {
      ...request,
      signature: await this.signer.sign(request),
    };
  }
}

export class GetNewIdResponseBuilder {
  constructor(
    protected host: string,
    privateKey: string,
    private readonly signer = new Signer(privateKey, new ResponseDefinition())
  ) {}

  async buildResponse(
    receiver: string,
    newId: Identifier,
    timestampInSec = getTimeStampInSec()
  ): Promise<GetNewIdResponse> {
    const request: Unsigned<GetNewIdResponse> = {
      body: {
        identifiers: [newId],
      },
      sender: this.host,
      receiver,
      timestamp: timestampInSec,
    };

    return {
      ...request,
      signature: await this.signer.sign(request),
    };
  }
}

export class Get3PCResponseBuilder {
  buildResponse(cookieFound: Test3Pc | undefined): Get3PcResponse | Error {
    return cookieFound ? { '3pc': cookieFound } : { message: '3PC not supported' };
  }
}

export class DeleteIdsPrefsResponseBuilder extends ResponseBuilderWithRedirect<DeleteIdsPrefsResponse> {
  constructor(
    host: string,
    privateKey: string,
    private readonly signer = new Signer(privateKey, new ResponseDefinition())
  ) {
    super(host);
  }

  async buildResponse(receiver: string, timestampInSec = getTimeStampInSec()): Promise<DeleteIdsPrefsResponse> {
    const request: Unsigned<DeleteIdsPrefsResponse> = {
      sender: this.host,
      receiver,
      timestamp: timestampInSec,
      body: {
        identifiers: [],
        preferences: undefined,
      },
    };

    return {
      ...request,
      signature: await this.signer.sign(request),
    };
  }
}
