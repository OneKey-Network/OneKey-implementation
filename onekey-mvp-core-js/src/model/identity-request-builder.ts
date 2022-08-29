import { RestRequestBuilder } from '@core/model/request-builders';
import { participantEndpoints } from '@core/endpoints';

export class GetIdentityRequestBuilder extends RestRequestBuilder<undefined> {
  constructor(serverHost: string) {
    super(serverHost, participantEndpoints.identity);
  }

  buildRequest(): undefined {
    return undefined;
  }
}
