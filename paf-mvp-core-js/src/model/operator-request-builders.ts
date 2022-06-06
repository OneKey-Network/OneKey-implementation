import { GetIdsPrefsRequest, GetNewIdRequest, IdsAndPreferences, PostIdsPrefsRequest } from './generated-model';
import { Unsigned } from './model';
import { jsonOperatorEndpoints, redirectEndpoints } from '../endpoints';
import { getTimeStampInSec } from '../timestamp';
import { RestAndRedirectRequestBuilder, RestRequestBuilder } from '@core/model/request-builders';
import { SignerImpl } from '@core/crypto/signer';
import {
  RequestDefinition,
  RequestWithBodyDefinition,
  RequestWithoutBodyDefinition,
  RestContext,
} from '@core/crypto/signing-definition';
import { privateKeyFromString } from '@core/crypto/keys';

export class Get3PCRequestBuilder extends RestRequestBuilder<undefined> {
  constructor(operatorHost: string) {
    super(operatorHost, jsonOperatorEndpoints.verify3PC);
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
    private readonly signer = new SignerImpl(privateKeyFromString(privateKey), new RequestWithoutBodyDefinition())
  ) {
    super(operatorHost, jsonOperatorEndpoints.newId);
  }

  buildRestRequest(context: RestContext, timestamp = getTimeStampInSec()): GetNewIdRequest {
    const request: Unsigned<GetNewIdRequest> = {
      sender: this.clientHost,
      receiver: this.serverHost,
      timestamp,
    };
    return {
      ...request,
      signature: this.signer.sign({ request, context }),
    };
  }
}

export class GetIdsPrefsRequestBuilder extends RestAndRedirectRequestBuilder<GetIdsPrefsRequest> {
  constructor(
    operatorHost: string,
    clientHost: string,
    privateKey: string,
    definition: RequestDefinition<GetIdsPrefsRequest> = new RequestWithoutBodyDefinition()
  ) {
    super(operatorHost, clientHost, jsonOperatorEndpoints.read, redirectEndpoints.read, privateKey, definition);
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
    definition: RequestDefinition<PostIdsPrefsRequest> = new RequestWithBodyDefinition()
  ) {
    super(operatorHost, clientHost, jsonOperatorEndpoints.write, redirectEndpoints.write, privateKey, definition);
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
