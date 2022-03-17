import {RestRequestBuilder} from "@core/model/request-builders";
import {participantEndpoints} from "@core/endpoints";

export class GetIdentityRequestBuilder extends RestRequestBuilder<undefined> {
    constructor(operatorHost: string, clientHost: string) {
        super(operatorHost, clientHost, participantEndpoints.identity);
    }

    buildRequest(): undefined {
        return undefined;
    }
}
