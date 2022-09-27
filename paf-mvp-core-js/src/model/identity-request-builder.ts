import { RestRequestBuilder } from './request-builders';
import { participantEndpoints } from '..';

export class GetIdentityRequestBuilder extends RestRequestBuilder<undefined> {
  constructor(serverHost: string) {
    super(serverHost, participantEndpoints.identity);
  }

  buildRequest(): undefined {
    return undefined;
  }
}
