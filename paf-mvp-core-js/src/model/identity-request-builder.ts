import { RestRequestBuilder } from '@onekey/core/model/request-builders';
import { participant } from '@onekey/core/routes';

export class GetIdentityRequestBuilder extends RestRequestBuilder<undefined> {
  constructor(serverHost: string) {
    super(serverHost, participant.identity.rest);
  }

  buildRequest(): undefined {
    return undefined;
  }
}
