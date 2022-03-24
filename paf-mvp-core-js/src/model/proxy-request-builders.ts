import {
    GetIdsPrefsResponse,
    Identifiers,
    IdsAndPreferences,
    PostSignPreferencesRequest,
    Preferences,
    PreferencesData
} from './generated-model';
import {jsonProxyEndpoints} from '../endpoints';
import {setInQueryString} from '../express/utils';

export abstract class ProxyRestRequestBuilder<T extends object | undefined> {
    constructor(public proxyHost: string, protected restEndpoint: string) {
    }

    protected getProxyUrl(endpoint: string, pafQuery: object | undefined = undefined): URL {
        let url = new URL(`https://${this.proxyHost}${endpoint}`);

        if (pafQuery) {
            url = setInQueryString(url, pafQuery);
        }

        return url;
    }

    getRestUrl(request: T): URL {
        return this.getProxyUrl(this.restEndpoint, request);
    }
}

export class ProxyRestSignPreferencesRequestBuilder extends ProxyRestRequestBuilder<PostSignPreferencesRequest> {

    constructor(proxyHost: string) {
        super(proxyHost, jsonProxyEndpoints.signPrefs);
    }

    buildRequest(identifiers: Identifiers, data: PreferencesData): PostSignPreferencesRequest {
        return {
            identifiers,
            unsignedPreferences: {
                version: '0.1',
                data
            }
        };
    }
}

export class ProxyRestSignPostIdsPrefsRequestBuilder extends ProxyRestRequestBuilder<IdsAndPreferences> {

    constructor(proxyHost: string) {
        super(proxyHost, jsonProxyEndpoints.signWrite);
    }

    buildRequest(identifiers: Identifiers, preferences: Preferences): IdsAndPreferences {
        return {
            identifiers,
            preferences
        };
    }
}

export class ProxyRestVerifyGetIdsPrefsRequestBuilder extends ProxyRestRequestBuilder<GetIdsPrefsResponse> {

    constructor(proxyHost: string) {
        super(proxyHost, jsonProxyEndpoints.verifyRead);
    }
}
