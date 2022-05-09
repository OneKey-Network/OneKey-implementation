import { GetIdsPrefsRequest, GetNewIdRequest, IdsAndPreferences, PostIdsPrefsRequest } from './generated-model';
import { Unsigned } from './model';
import { jsonOperatorEndpoints, redirectEndpoints } from '../endpoints';
import { getTimeStampInSec } from '../timestamp';
import { RestAndRedirectRequestBuilder, SignedRestRequestBuilder } from '@core/model/request-builders';
import { Signer } from '@core/crypto/signer';
import { RequestWithBodyDefinition, RequestWithoutBodyDefinition } from '@core/crypto/signing-definition';
import { privateKeyFromString } from '@core/crypto/keys';

export class GetIdsPrefsRequestBuilder extends RestAndRedirectRequestBuilder<GetIdsPrefsRequest> {
  constructor(
    operatorHost: string,
    clientHost: string,
    privateKey: string,
    private readonly signer = new Signer(privateKeyFromString(privateKey), new RequestWithoutBodyDefinition())
  ) {
    super(operatorHost, clientHost, jsonOperatorEndpoints.read, redirectEndpoints.read, privateKey);
  }

  buildRequest(timestamp = getTimeStampInSec()): GetIdsPrefsRequest {
    const request: Unsigned<GetIdsPrefsRequest> = {
      sender: this.clientHost,
      receiver: this.serverHost,
      timestamp,
    };
    return {
      ...request,
      signature: this.signer.sign({ request }),
    };
  }
}

export class PostIdsPrefsRequestBuilder extends RestAndRedirectRequestBuilder<PostIdsPrefsRequest> {
  constructor(
    operatorHost: string,
    clientHost: string,
    privateKey: string,
    private readonly signer = new Signer(privateKeyFromString(privateKey), new RequestWithBodyDefinition())
  ) {
    super(operatorHost, clientHost, jsonOperatorEndpoints.write, redirectEndpoints.write, privateKey);
  }

  buildRequest(idsAndPreferences: IdsAndPreferences, timestamp = getTimeStampInSec()): PostIdsPrefsRequest {
    const request: Unsigned<PostIdsPrefsRequest> = {
      body: idsAndPreferences,
      sender: this.clientHost,
      receiver: this.serverHost,
      timestamp,
    };
    return {
      ...request,
      signature: this.signer.sign({ request }),
    };
  }

  /**
   * Note: no request parameter as it is used as POST payload, not query string
   */
  getRestUrl(): URL {
    return this.getUrl(this.restEndpoint);
  }
}

export class GetNewIdRequestBuilder extends SignedRestRequestBuilder<GetNewIdRequest> {
  constructor(
    operatorHost: string,
    clientHost: string,
    privateKey: string,
    private readonly signer = new Signer(privateKeyFromString(privateKey), new RequestWithoutBodyDefinition())
  ) {
    super(operatorHost, clientHost, jsonOperatorEndpoints.newId, privateKey);
  }

  buildRequest(timestamp = getTimeStampInSec()): GetNewIdRequest {
    const request: Unsigned<GetNewIdRequest> = {
      sender: this.clientHost,
      receiver: this.serverHost,
      timestamp,
    };
    return {
      ...request,
      signature: this.signer.sign({ request }),
    };
  }
}

export class Get3PCRequestBuilder extends SignedRestRequestBuilder<undefined> {
  constructor(operatorHost: string, clientHost: string, privateKey: string) {
    super(operatorHost, clientHost, jsonOperatorEndpoints.verify3PC, privateKey);
  }

  buildRequest(): undefined {
    return undefined;
  }

  /**
   * Note: no request parameter
   */
  getRestUrl(): URL {
    return this.getUrl(this.restEndpoint);
  }
}
