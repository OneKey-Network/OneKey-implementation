import { RestRequestBuilder } from '@onekey/core/model/request-builders';
import { participantEndpoints } from '@onekey/core/endpoints';

export class GetIdentityRequestBuilder extends RestRequestBuilder<undefined> {
  constructor(serverHost: string) {
    super(serverHost, participantEndpoints.identity);
  }

  buildRequest(): undefined {
    return undefined;
  }
}
