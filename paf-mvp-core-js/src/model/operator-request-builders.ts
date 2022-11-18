import {
  DeleteIdsPrefsRequest,
  GetIdsPrefsRequest,
  GetNewIdRequest,
  IdsAndPreferences,
  PostIdsPrefsRequest,
} from './generated-model';
import { Unsigned } from './model';
import { operator } from '../routes';
import { getTimeStampInSec } from '../timestamp';
import { RestAndRedirectRequestBuilder, RestRequestBuilder } from '@onekey/core/model/request-builders';
import { Signer } from '@onekey/core/crypto/signer';
import {
  RequestSigningDefinition,
  RequestWithBodyDefinition,
  RequestWithoutBodyDefinition,
  RestContext,
} from '@onekey/core/signing-definition/request-signing-definition';

export class Get3PCRequestBuilder extends RestRequestBuilder<undefined> {
  constructor(operatorHost: string) {
    super(operatorHost, operator.verify3PC.rest);
  }

  buildRestRequest(): undefined {
    return undefined;
  }

  /**
   * Note: no request parameter
   */
  getRestUrl(): URL {
    return this.getUrl(this.restEndpoint);
  }
}

export class GetNewIdRequestBuilder extends RestRequestBuilder<GetNewIdRequest> {
  constructor(
    operatorHost: string,
    protected clientHost: string,
    privateKey: string,
    private readonly signer = new Signer(privateKey, new RequestWithoutBodyDefinition())
  ) {
    super(operatorHost, operator.newId.rest);
  }

  async buildRestRequest(context: RestContext, timestamp = getTimeStampInSec()): Promise<GetNewIdRequest> {
    const request: Unsigned<GetNewIdRequest> = {
      sender: this.clientHost,
      receiver: this.serverHost,
      timestamp,
    };
    return {
      ...request,
      signature: await this.signer.sign({ request, context }),
    };
  }
}

export class GetIdsPrefsRequestBuilder extends RestAndRedirectRequestBuilder<GetIdsPrefsRequest> {
  constructor(
    operatorHost: string,
    clientHost: string,
    privateKey: string,
    definition: RequestSigningDefinition<GetIdsPrefsRequest> = new RequestWithoutBodyDefinition()
  ) {
    super(operatorHost, clientHost, operator.read.rest, operator.read.redirect, privateKey, definition);
  }

  protected buildUnsignedRequest(data: undefined, timestamp: number): Unsigned<GetIdsPrefsRequest> {
    return {
      sender: this.clientHost,
      receiver: this.serverHost,
      timestamp,
    };
  }
}

export class PostIdsPrefsRequestBuilder extends RestAndRedirectRequestBuilder<PostIdsPrefsRequest, IdsAndPreferences> {
  constructor(
    operatorHost: string,
    clientHost: string,
    privateKey: string,
    definition: RequestSigningDefinition<PostIdsPrefsRequest> = new RequestWithBodyDefinition()
  ) {
    super(operatorHost, clientHost, operator.write.rest, operator.write.redirect, privateKey, definition);
  }

  protected buildUnsignedRequest(
    idsAndPreferences: IdsAndPreferences,
    timestamp: number
  ): Unsigned<PostIdsPrefsRequest> {
    return {
      body: idsAndPreferences,
      sender: this.clientHost,
      receiver: this.serverHost,
      timestamp,
    };
  }

  /**
   * Note: no request parameter as it is used as POST payload, not query string
   */
  getRestUrl(): URL {
    return this.getUrl(this.restEndpoint);
  }
}

export class DeleteIdsPrefsRequestBuilder extends RestAndRedirectRequestBuilder<DeleteIdsPrefsRequest> {
  constructor(
    operatorHost: string,
    clientHost: string,
    privateKey: string,
    definition: RequestSigningDefinition<DeleteIdsPrefsRequest> = new RequestWithoutBodyDefinition()
  ) {
    super(operatorHost, clientHost, operator.delete.rest, operator.delete.redirect, privateKey, definition);
  }

  protected buildUnsignedRequest(data: undefined, timestamp: number): Unsigned<DeleteIdsPrefsRequest> {
    return {
      sender: this.clientHost,
      receiver: this.serverHost,
      timestamp,
    };
  }
}
