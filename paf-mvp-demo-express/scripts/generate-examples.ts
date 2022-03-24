import {
    Error,
    Get3PcResponse,
    GetIdentityResponse,
    GetIdsPrefsRequest,
    GetIdsPrefsResponse,
    GetNewIdRequest,
    GetNewIdResponse,
    Identifier,
    Identifiers,
    IdsAndPreferences,
    PostIdsPrefsRequest,
    PostIdsPrefsResponse,
    PostSignPreferencesRequest,
    Preferences,
    RedirectGetIdsPrefsRequest,
    RedirectGetIdsPrefsResponse,
    RedirectPostIdsPrefsRequest,
    RedirectPostIdsPrefsResponse,
    Test3Pc
} from '@core/model/generated-model';
import {toIdsCookie, toPrefsCookie, toTest3pcCookie} from '@core/cookies';
import {getTimeStampInSec} from '@core/timestamp';
import {advertiserConfig, cmpConfig, operatorConfig, publisherConfig} from '../src/config';
import path from 'path';
import {OperatorClient} from '@operator-client/operator-client';
import {
    Get3PCRequestBuilder,
    GetIdsPrefsRequestBuilder,
    GetNewIdRequestBuilder,
    PostIdsPrefsRequestBuilder
} from '@core/model/operator-request-builders';
import {OperatorApi} from '@operator/operator-api';
import {
    Get3PCResponseBuilder,
    GetIdsPrefsResponseBuilder,
    GetNewIdResponseBuilder,
    PostIdsPrefsResponseBuilder
} from '@core/model/operator-response-builders';
import {Validator} from 'jsonschema';
import * as fs from 'fs';
import {
    ProxyRestSignPostIdsPrefsRequestBuilder,
    ProxyRestSignPreferencesRequestBuilder,
    ProxyRestVerifyGetIdsPrefsRequestBuilder
} from '@core/model/proxy-request-builders';
import isEqual from 'lodash.isequal';
import cloneDeep from 'lodash.clonedeep';
import {GetIdentityResponseBuilder} from '@core/model/identity-response-builder';
import {GetIdentityRequestBuilder} from '@core/model/identity-request-builder';
import {cmpPrivateConfig} from '../src/cmp';
import {operatorPrivateConfig} from '../src/operator';

const getTimestamp = (dateString: string) => getTimeStampInSec(new Date(dateString));
const getUrl = (method: 'POST' | 'GET', url: URL): string => `${method} ${url.pathname}${url.search}\nHost: ${url.host}`;
const getGETUrl = (url: URL): string => getUrl('GET', url);
const getPOSTUrl = (url: URL): string => getUrl('POST', url);
const getRedirect = (url: URL): string => `303 ${url}`;

const fileExists = async (path: string) => {
    // the result can be either false (from the caught error) or it can be an fs.stats object
    const result = await fs.promises.stat(path).catch(err => {
        if (err.code === 'ENOENT') {
            return false;
        }
        throw err;
    });

    return result !== false;
};

// Remove undefined properties
// Other options are super verbose (ex: https://stackoverflow.com/questions/30812765/how-to-remove-undefined-and-null-values-from-an-object-using-lodash)
const deepRemoveUndefined = <T>(object: T): T => JSON.parse(JSON.stringify(object));

if (!(process.argv[2]?.length > 0)) {
    const scriptName = path.basename(__filename);
    console.error(`Usage: ts-node -r tsconfig-paths/register ${scriptName} <outputDir>
Example: ts-node -r tsconfig-paths/register ${scriptName} ../../../addressable-network-proposals/mvp-spec/partials`);
    process.exit(1);
}

const outputDir = path.join(process.cwd(), process.argv[2]);

if (!fs.existsSync(outputDir)) {
    throw `Output dir not found: "${outputDir}"`;
}

// The examples are not supposed to look like a demo but a real environment
operatorConfig.host = 'operator.paf-operation-domain.io';
cmpConfig.host = 'cmp.com';
advertiserConfig.host = 'advertiser.com';
publisherConfig.host = 'publisher.com';

class Examples {
    // **************************** Main data
    unpersistedIdJson: Identifier = undefined;
    idJson: Identifier = undefined;
    preferencesJson: Preferences = undefined;

    // **************************** Cookies
    // JSON version
    ['ids_cookie-prettyJson']: Identifiers;
    // Stringified version
    ids_cookieTxt: string;

    // JSON version
    ['preferences_cookie-prettyJson']: Preferences;
    // Stringified version
    preferences_cookieTxt: string;

    // JSON version
    ['test_3pc_cookie-prettyJson']: Test3Pc;
    // Stringified version
    test_3pc_cookieTxt: string;

    // **************************** Read
    getIdsPrefsRequestJson: GetIdsPrefsRequest = undefined;
    getIdsPrefsRequestHttp: string;

    getIdsPrefsResponse_knownJson: GetIdsPrefsResponse = undefined;
    getIdsPrefsResponse_unknownJson: GetIdsPrefsResponse = undefined;

    redirectGetIdsPrefsRequestJson: RedirectGetIdsPrefsRequest = undefined;
    redirectGetIdsPrefsRequestHttp: string;

    redirectGetIdsPrefsResponse_knownJson: RedirectGetIdsPrefsResponse = undefined;
    redirectGetIdsPrefsResponse_knownTxt: string;
    redirectGetIdsPrefsResponse_unknownJson: RedirectGetIdsPrefsResponse = undefined;
    redirectGetIdsPrefsResponse_unknownTxt: string;

    // **************************** Write
    postIdsPrefsRequestJson: PostIdsPrefsRequest = undefined;
    postIdsPrefsRequestHttp: string;

    postIdsPrefsResponseJson: PostIdsPrefsResponse = undefined;

    redirectPostIdsPrefsRequestJson: RedirectPostIdsPrefsRequest = undefined;
    redirectPostIdsPrefsRequestHttp: string;
    redirectPostIdsPrefsResponseJson: RedirectPostIdsPrefsResponse = undefined;
    redirectPostIdsPrefsResponseTxt: string;

    // **************************** Get new ID
    getNewIdRequestJson: GetNewIdRequest = undefined;
    getNewIdRequestHttp: string;

    getNewIdResponseJson: GetNewIdResponse = undefined;

    // **************************** Verify 3PC
    get3pcRequestHttp: string;
    get3pcResponse_supportedJson: Get3PcResponse = undefined;
    get3pcResponse_unsupportedJson: Error = undefined;

    // **************************** Identity
    getIdentityRequest_operatorHttp: string;
    getIdentityResponse_operatorJson: GetIdentityResponse = undefined;

    getIdentityRequest_cmpHttp: string;
    getIdentityResponse_cmpJson: GetIdentityResponse = undefined;

    // **************************** Proxy
    signPreferencesHttp: string;
    signPreferencesJson: PostSignPreferencesRequest = undefined;
    signPostIdsPrefsHttp: string;
    signPostIdsPrefsJson: IdsAndPreferences = undefined;
    verifyGetIdsPrefsHttp: string;
    verifyGetIdsPrefs_invalidJson: Error = undefined;

    constructor(protected outputDir: string) {
    }

    protected buildExamples() {
        const operatorAPI = new OperatorApi(operatorConfig.host, operatorPrivateConfig.privateKey);
        const originalAdvertiserUrl = new URL(`https://${advertiserConfig.host}/news/2022/02/07/something-crazy-happened?utm_content=campaign%20content`);

        // **************************** Main data
        this.setObject('unpersistedIdJson', {
            persisted: false,
            ...operatorAPI.signId('2e71121a-4feb-4a34-b7d1-839587d36390', getTimestamp('2022/01/24 17:19'))
        });
        this.setObject('idJson', operatorAPI.signId('7435313e-caee-4889-8ad7-0acd0114ae3c', getTimestamp('2022/01/18 12:13')));

        const cmpClient = new OperatorClient(cmpConfig.host, cmpPrivateConfig.privateKey);
        this.setObject('preferencesJson', cmpClient.buildPreferences([this.idJson], {use_browsing_for_personalization: true}, getTimestamp('2022/01/18 12:16')));

        // **************************** Cookies
        this['ids_cookie-prettyJson'] = [this.idJson];
        this.ids_cookieTxt = toIdsCookie(this['ids_cookie-prettyJson']);

        this['preferences_cookie-prettyJson'] = this.preferencesJson;
        this.preferences_cookieTxt = toPrefsCookie(this['preferences_cookie-prettyJson']);

        this['test_3pc_cookie-prettyJson'] = {
            timestamp: getTimestamp('2022/01/26 17:24')
        };
        this.test_3pc_cookieTxt = toTest3pcCookie(this['test_3pc_cookie-prettyJson']);

        // **************************** Read
        const getIdsPrefsRequestBuilder = new GetIdsPrefsRequestBuilder(operatorConfig.host, cmpConfig.host, cmpPrivateConfig.privateKey);
        const getIdsPrefsResponseBuilder = new GetIdsPrefsResponseBuilder(operatorConfig.host, cmpPrivateConfig.privateKey);
        this.setRestMessage('getIdsPrefsRequestJson', getIdsPrefsRequestBuilder.buildRequest(getTimestamp('2022/01/24 17:19')));
        this.getIdsPrefsRequestHttp = getGETUrl(getIdsPrefsRequestBuilder.getRestUrl(this.getIdsPrefsRequestJson));
        this.setRestMessage('getIdsPrefsResponse_knownJson', getIdsPrefsResponseBuilder.buildResponse(
            advertiserConfig.host,
            {
                identifiers: [this.idJson],
                preferences: this.preferencesJson
            },
            getTimestamp('2022/01/24 17:19:10')
        ));
        this.setRestMessage('getIdsPrefsResponse_unknownJson', getIdsPrefsResponseBuilder.buildResponse(
            advertiserConfig.host,
            {
                identifiers: [this.unpersistedIdJson]
            },
            getTimestamp('2022/01/24 17:19:10')
        ));

        this.setRedirectRequest('redirectGetIdsPrefsRequestJson', getIdsPrefsRequestBuilder.toRedirectRequest(this.getIdsPrefsRequestJson, originalAdvertiserUrl));
        this.redirectGetIdsPrefsRequestHttp = getGETUrl(getIdsPrefsRequestBuilder.getRedirectUrl(this.redirectGetIdsPrefsRequestJson));

        this.redirectGetIdsPrefsResponse_knownJson = getIdsPrefsResponseBuilder.toRedirectResponse(this.getIdsPrefsResponse_knownJson, 200);
        this.redirectGetIdsPrefsResponse_knownTxt = getRedirect(getIdsPrefsResponseBuilder.getRedirectUrl(originalAdvertiserUrl, this.redirectGetIdsPrefsResponse_knownJson));
        this.redirectGetIdsPrefsResponse_unknownJson = getIdsPrefsResponseBuilder.toRedirectResponse(this.getIdsPrefsResponse_unknownJson, 200);
        this.redirectGetIdsPrefsResponse_unknownTxt = getRedirect(getIdsPrefsResponseBuilder.getRedirectUrl(originalAdvertiserUrl, this.redirectGetIdsPrefsResponse_unknownJson));

        // **************************** Write
        const postIdsPrefsRequestBuilder = new PostIdsPrefsRequestBuilder(operatorConfig.host, cmpConfig.host, cmpPrivateConfig.privateKey);
        const postIdsPrefsResponseBuilder = new PostIdsPrefsResponseBuilder(operatorConfig.host, cmpPrivateConfig.privateKey);
        this.setRestMessage('postIdsPrefsRequestJson', postIdsPrefsRequestBuilder.buildRequest({
                identifiers: [this.idJson],
                preferences: this.preferencesJson
            }, getTimestamp('2022/01/25 09:01'))
        );
        this.postIdsPrefsRequestHttp = getPOSTUrl(postIdsPrefsRequestBuilder.getRestUrl()); // Notice is POST url
        this.setRestMessage('postIdsPrefsResponseJson', postIdsPrefsResponseBuilder.buildResponse(cmpConfig.host, {
                identifiers: [this.idJson],
                preferences: this.preferencesJson
            }, getTimestamp('2022/01/25 09:01:03'))
        );

        this.setRedirectRequest('redirectPostIdsPrefsRequestJson', postIdsPrefsRequestBuilder.toRedirectRequest(this.postIdsPrefsRequestJson, originalAdvertiserUrl));
        this.redirectPostIdsPrefsRequestHttp = getGETUrl(postIdsPrefsRequestBuilder.getRedirectUrl(this.redirectPostIdsPrefsRequestJson));
        this.redirectPostIdsPrefsResponseJson = postIdsPrefsResponseBuilder.toRedirectResponse(this.postIdsPrefsResponseJson, 200);
        this.redirectPostIdsPrefsResponseTxt = getRedirect(postIdsPrefsResponseBuilder.getRedirectUrl(originalAdvertiserUrl, this.redirectPostIdsPrefsResponseJson));

        // **************************** Get new ID
        const getNewIdRequestBuilder = new GetNewIdRequestBuilder(operatorConfig.host, cmpConfig.host, cmpPrivateConfig.privateKey);
        const getNewIdResponseBuilder = new GetNewIdResponseBuilder(operatorConfig.host, operatorPrivateConfig.privateKey);
        this.setRestMessage('getNewIdRequestJson', getNewIdRequestBuilder.buildRequest(getTimestamp('2022/03/01 19:04')));
        this.getNewIdRequestHttp = getGETUrl(getNewIdRequestBuilder.getRestUrl(this.getNewIdRequestJson));

        this.setRestMessage('getNewIdResponseJson', getNewIdResponseBuilder.buildResponse(cmpConfig.host, this.unpersistedIdJson, getTimestamp('2022/03/01 19:04:47')));

        // **************************** Verify 3PC
        const get3PCRequestBuilder = new Get3PCRequestBuilder(operatorConfig.host, cmpConfig.host, cmpPrivateConfig.privateKey);
        const get3PCResponseBuilder = new Get3PCResponseBuilder(operatorConfig.host, operatorPrivateConfig.privateKey);
        this.get3pcRequestHttp = getGETUrl(get3PCRequestBuilder.getRestUrl());

        this.get3pcResponse_supportedJson = get3PCResponseBuilder.buildResponse(this['test_3pc_cookie-prettyJson']) as Get3PcResponse;
        this.get3pcResponse_unsupportedJson = get3PCResponseBuilder.buildResponse(undefined) as Error;

        // **************************** Identity
        const getIdentityRequestBuilder_operator = new GetIdentityRequestBuilder(operatorConfig.host);
        const getIdentityResponseBuilder_operator = new GetIdentityResponseBuilder(operatorConfig.name, operatorPrivateConfig.type);
        this.getIdentityRequest_operatorHttp = getGETUrl(getIdentityRequestBuilder_operator.getRestUrl(undefined));
        this.getIdentityResponse_operatorJson = getIdentityResponseBuilder_operator.buildResponse([operatorPrivateConfig.currentPublicKey]);

        // TODO add examples with multiple keys
        const getIdentityRequestBuilder_cmp = new GetIdentityRequestBuilder(cmpConfig.host);
        const getIdentityResponseBuilder_cmp = new GetIdentityResponseBuilder(cmpConfig.name, cmpPrivateConfig.type);
        this.getIdentityRequest_cmpHttp = getGETUrl(getIdentityRequestBuilder_cmp.getRestUrl(undefined));
        this.getIdentityResponse_cmpJson = getIdentityResponseBuilder_cmp.buildResponse([cmpPrivateConfig.currentPublicKey]);

        // **************************** Proxy
        const signPreferencesRequestBuilder = new ProxyRestSignPreferencesRequestBuilder(cmpConfig.host);
        this.signPreferencesHttp = getPOSTUrl(signPreferencesRequestBuilder.getRestUrl(undefined)); // Notice is POST url
        this.signPreferencesJson = signPreferencesRequestBuilder.buildRequest([this.idJson], {use_browsing_for_personalization: true});

        const signPostIdsPrefsRequestBuilder = new ProxyRestSignPostIdsPrefsRequestBuilder(cmpConfig.host);
        this.signPostIdsPrefsHttp = getPOSTUrl(signPostIdsPrefsRequestBuilder.getRestUrl(undefined)); // Notice is POST url
        this.signPostIdsPrefsJson = signPostIdsPrefsRequestBuilder.buildRequest([this.idJson], this.preferencesJson);

        const verifyGetIdsPrefsRequestBuilder = new ProxyRestVerifyGetIdsPrefsRequestBuilder(cmpConfig.host);
        this.verifyGetIdsPrefsHttp = getPOSTUrl(verifyGetIdsPrefsRequestBuilder.getRestUrl(undefined)); // Notice is POST url
        this.verifyGetIdsPrefs_invalidJson = {message: 'Invalid signature'};
    }

    private setObject<T extends { source: U }, U extends { signature: string }>(keyName: keyof Examples, newValue: T) {
        const dict = this.getObjectAsDict();

        const oldValue = dict[keyName] as T;
        dict[keyName] = newValue;

        (dict[keyName] as T).source.signature = Examples.getSignature(oldValue, newValue, Examples.extractSourceSignature);
    }

    private setRedirectRequest<T extends { request: U }, U extends { signature: string }>(keyName: keyof Examples, newValue: T) {
        const dict = this.getObjectAsDict();

        const oldValue = dict[keyName] as T;
        dict[keyName] = newValue;

        (dict[keyName] as T).request.signature = Examples.getSignature(oldValue, newValue, Examples.extractRequestSignature);
    }

    private setRestMessage<T extends { signature: string }>(keyName: keyof Examples, newValue: T) {
        const dict = this.getObjectAsDict();

        const oldValue = dict[keyName] as T;
        dict[keyName] = newValue;

        (dict[keyName] as T).signature = Examples.getSignature(oldValue, newValue, Examples.extractSignature);
    }

    private static extractSignature<T extends { signature: string }>(valueWithSignature: T) {
        const value = cloneDeep(valueWithSignature);
        const signature = value.signature;
        value.signature = undefined;

        return {signature, value};
    }

    private static extractRequestSignature<T extends { request: U }, U extends { signature: string }>(valueWithSignature: T) {
        const value = cloneDeep(valueWithSignature);
        const signature = value.request.signature;
        value.request.signature = undefined;

        return {signature, value};
    }

    private static extractSourceSignature<T extends { source: U }, U extends { signature: string }>(valueWithSignature: T) {
        const value = cloneDeep(valueWithSignature);
        const signature = value.source.signature;
        value.source.signature = undefined;

        return {signature, value};
    }

    private static getSignature<T>(oldValue: T, newValue: T, extractSignature: (value: T) => { signature: string, value: T }) {
        const newExtract = extractSignature(newValue);

        if (oldValue !== undefined) {
            const oldExtract = extractSignature(oldValue);

            const equal = isEqual(deepRemoveUndefined(oldExtract.value), deepRemoveUndefined(newExtract.value));

            if (equal) {
                // Old and new value are equal, appart on the signature property
                // This means we can keep the old signature
                return oldExtract.signature;
            } else {
                console.log('objects are different:');
                console.log(JSON.stringify(oldExtract.value, null, 2));
                console.log(JSON.stringify(newExtract.value, null, 2));
            }
        }
        // Keep new signature if data is different
        return newExtract.signature;
    }

    async updateFiles() {

        await this.loadExistingFiles();

        this.buildExamples();

        const dict = this.getObjectAsDict();
        for (const key of Object.keys(this)) {
            let baseName: string;
            let fileBody: string;
            if (key.endsWith('Json')) {
                baseName = `${key.replace(/Json$/, '')}.json`;
                fileBody = JSON.stringify(dict[key], null, 2);
            } else if (key.endsWith('Txt')) {
                baseName = `${key.replace(/Txt$/, '')}.txt`;
                fileBody = dict[key] as string;
            } else if (key.endsWith('Http')) {
                baseName = `${key.replace(/Http$/, '')}.http`;
                fileBody = dict[key] as string;
            } else {
                continue;
            }

            const fullPath = path.join(this.outputDir, baseName);
            console.log(fullPath);
            await fs.promises.writeFile(fullPath, fileBody);
        }
    }

    private getObjectAsDict() {
        return this as unknown as { [typeName: string]: unknown };
    }

    private async loadExistingFiles() {
        const dict = this.getObjectAsDict();
        for (const key of Object.keys(this)) {
            // Search for a pre-existing file with the right name.
            // If it exists, load its content into the corresponding key of this object
            if (key.endsWith('Json')) {

                const baseName = `${key.replace(/Json$/, '')}.json`;
                const fullPath = path.join(this.outputDir, baseName);

                if (await fileExists(fullPath)) {
                    dict[key] = JSON.parse((await fs.promises.readFile(fullPath)).toString());
                }
            }
        }
    }
}

class SchemasValidator {

    private v = new Validator();
    private schemas: { [id: string]: any } = {};

    async initValidator(): Promise<this> {

        // FIXME use a parameter to validate examples. Or ignore validation
        const inputDir = path.join(__dirname, '..', '..', 'paf-mvp-core-js', 'json-schemas');
        const files = await fs.promises.readdir(inputDir);
        const schemas = await Promise.all(files
            .map(async (f: string) => JSON.parse(await fs.promises.readFile(path.join(inputDir, f), 'utf-8')))
        );

        schemas.forEach((schema: any) => {
            this.v.addSchema(schema, schema.$id);
            this.schemas[schema.$id] = schema;
        });

        return this;
    }

    validate(examples: Examples): this {

        // TODO map each example with its schema
        this.v.validate(examples.idJson, this.schemas['identifier']);

        return this;
    }
}

(async () => {
    const examples = new Examples(outputDir);

    // TODO activate validation
    /*
    const validator = await new SchemasValidator().initValidator();
    validator.validate(examples)
     */

    await examples.updateFiles();
})();
