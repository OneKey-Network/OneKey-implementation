import {
    GetIdsPrefsRequest,
    GetIdsPrefsResponse,
    RedirectGetIdsPrefsRequest,
    GetNewIdRequest,
    GetNewIdResponse,
    Get3PcResponse,
    Identifier,
    PostIdsPrefsRequest,
    RedirectPostIdsPrefsRequest,
    PostIdsPrefsResponse,
    Preferences,
    Identifiers,
    Error
} from "paf-mvp-core-js/dist/model/generated-model";
import {toIdsCookie, toPrefsCookie} from "paf-mvp-core-js/dist/cookies";
import {advertiser, cmp, operator, publicKeys} from "../src/config";
import path from "path";
import {OperatorClient} from "paf-mvp-operator-client-express/dist/operator-client";
import {
    GetIdsPrefsURLBuilder,
    GetNewIdURLBuilder,
    Get3PCURLBuilder,
    GetIdentityURLBuilder,
    PostIdsPrefsURLBuilder
} from "paf-mvp-operator-client-express/dist/url-builders";
import {OperatorApi} from "paf-mvp-operator-express/dist/operator-api";
import {Validator} from "jsonschema";

const fs = require('fs').promises;

const getTimestamp = (dateString: string) => new Date(dateString).getTime() / 1000
const getGetUrl = (url: URL): string => `GET ${url}`
const getPOSTUrl = (url: URL): string => `POST ${url}`

class Examples {
    // **************************** Main data
    idJson: Identifier
    preferencesJson: Preferences

    // **************************** Cookies
    // JSON version
    ['ids_cookie-prettyJson']: Identifiers
    // Stringified version
    ids_cookieTxt: string

    // JSON version
    ['preferences_cookie-prettyJson']: Preferences
    // Stringified version
    preferences_cookieTxt: string

    // **************************** Read
    getIdsPrefsRequestJson: GetIdsPrefsRequest
    getIdsPrefsRequestHttp: string

    getIdsPrefsResponse_knownJson: GetIdsPrefsResponse // TODO redirect version
    getIdsPrefsResponse_unknownJson: GetIdsPrefsResponse // TODO redirect version
    // TODO http response?

    redirectGetIdsPrefsRequestJson: RedirectGetIdsPrefsRequest
    redirectGetIdsPrefsRequestHttp: string
    // TODO http redirect response x 2

    // **************************** Write
    postIdsPrefsRequestJson: PostIdsPrefsRequest
    postIdsPrefsRequestHttp: string

    postIdsPrefsResponseJson: PostIdsPrefsResponse // TODO redirect version
    // TODO http response?

    redirectPostIdsPrefsRequestJson: RedirectPostIdsPrefsRequest
    redirectPostIdsPrefsRequestHttp: string
    // TODO http redirect response

    // **************************** Get new ID
    getNewIdRequestJson: GetNewIdRequest
    getNewIdRequestHttp: string

    getNewIdResponseJson: GetNewIdResponse
    // TODO http response?

    // **************************** Verify 3PC
    get3pcRequestHttp: string
    get3pcResponse_supportedJson: Get3PcResponse
    get3pcResponse_unsupportedJson: Error

    // TODO http response?

    // **************************** Identity
    getIdentityRequestHttp: string

    // TODO JSON response
    // TODO http response

    constructor() {
        const operatorAPI = new OperatorApi(operator.host, operator.privateKey)
        const originalAdvertiserUrl = `https://${advertiser.host}/news/2022/02/07/something-crazy-happened?utm_content=campaign%20content`

        const newId: Identifier = {
            persisted: false,
            ...operatorAPI.signId("2e71121a-4feb-4a34-b7d1-839587d36390", getTimestamp("2022/01/24 17:19"))
        }

        // **************************** Main data
        this.idJson = operatorAPI.signId("7435313e-caee-4889-8ad7-0acd0114ae3c", getTimestamp("2022/01/18 12:13"));

        const cmpClient = new OperatorClient('https', operator.host, cmp.host, cmp.privateKey, publicKeys)
        this.preferencesJson = cmpClient.buildPreferences(this.idJson, true, getTimestamp("2022/01/18 12:16"))

        // **************************** Cookies
        this['ids_cookie-prettyJson'] = [this.idJson]
        this.ids_cookieTxt = toIdsCookie(this['ids_cookie-prettyJson'])

        this['preferences_cookie-prettyJson'] = this.preferencesJson
        this.preferences_cookieTxt = toPrefsCookie(this['preferences_cookie-prettyJson'])

        // **************************** Read
        const getIdsURLBuilder = new GetIdsPrefsURLBuilder('https', operator.host, cmp.host, cmp.privateKey)
        this.getIdsPrefsRequestJson = getIdsURLBuilder.buildRequest(getTimestamp("2022/01/24 17:19"))
        this.getIdsPrefsRequestHttp = getGetUrl(getIdsURLBuilder.getRestUrl(this.getIdsPrefsRequestJson))
        this.getIdsPrefsResponse_knownJson = operatorAPI.buildGetIdsPrefsResponse(advertiser.host, {
            identifiers: [this.idJson],
            preferences: this.preferencesJson
        }, getTimestamp("2022/01/24 17:19:10"))
        this.getIdsPrefsResponse_unknownJson = operatorAPI.buildGetIdsPrefsResponse(advertiser.host, {identifiers: [newId]}, getTimestamp("2022/01/24 17:19:10"))

        this.redirectGetIdsPrefsRequestJson = getIdsURLBuilder.toRedirectRequest(this.getIdsPrefsRequestJson, originalAdvertiserUrl)
        this.redirectGetIdsPrefsRequestHttp = getGetUrl(getIdsURLBuilder.getRedirectUrl(this.redirectGetIdsPrefsRequestJson))

        // **************************** Write
        const postIdsURLBuilder = new PostIdsPrefsURLBuilder('https', operator.host, cmp.host, cmp.privateKey)
        this.postIdsPrefsRequestJson = cmpClient.buildPostIdsPrefsRequest({
            identifiers: [this.idJson],
            preferences: this.preferencesJson
        }, getTimestamp("2022/01/25 09:01"))
        this.postIdsPrefsRequestHttp = getPOSTUrl(postIdsURLBuilder.getRestUrl(this.postIdsPrefsRequestJson)) // Notice is POST url
        this.postIdsPrefsResponseJson = operatorAPI.buildPostIdsPrefsResponse(cmp.host, {
            identifiers: [this.idJson],
            preferences: this.preferencesJson
        }, getTimestamp("2022/01/25 09:01:03"))

        this.redirectPostIdsPrefsRequestJson = postIdsURLBuilder.toRedirectRequest(this.postIdsPrefsRequestJson, originalAdvertiserUrl)
        this.redirectPostIdsPrefsRequestHttp = getGetUrl(postIdsURLBuilder.getRedirectUrl(this.redirectPostIdsPrefsRequestJson))

        // **************************** Get new ID
        const getNewIdURLBuilder = new GetNewIdURLBuilder('https', operator.host, cmp.host, cmp.privateKey)
        this.getNewIdRequestJson = getNewIdURLBuilder.buildRequest(getTimestamp("2022/03/01 19:04"))
        this.getNewIdRequestHttp = getGetUrl(getNewIdURLBuilder.getRestUrl(this.getNewIdRequestJson))

        this.getNewIdResponseJson = operatorAPI.buildGetNewIdResponse(cmp.host, newId, getTimestamp("2022/03/01 19:04:47"))

        // **************************** Verify 3PC
        const get3PCURLBuilder = new Get3PCURLBuilder('https', operator.host, cmp.host, cmp.privateKey)
        this.get3pcRequestHttp = getGetUrl(get3PCURLBuilder.getRestUrl(undefined))

        this.get3pcResponse_supportedJson = operatorAPI.build3PC(true) as Get3PcResponse
        this.get3pcResponse_unsupportedJson = operatorAPI.build3PC(false) as Error

        // **************************** Identity
        const getIdentityURLBuilder = new GetIdentityURLBuilder('https', operator.host, advertiser.host, cmp.privateKey)
        this.getIdentityRequestHttp = getGetUrl(getIdentityURLBuilder.getRestUrl(undefined))
    }
}

class SchemasValidator {

    private v = new Validator();
    private schemas: {[id: string]: any} = {}

    async initValidator(): Promise<this> {

        // FIXME use a parameter to validate examples. Or ignore validation
        const inputDir = path.join(__dirname, '..', 'node_modules', 'paf-mvp-core-js', 'json-schemas');
        const files = await fs.promises.readdir(inputDir);
        const schemas = await Promise.all(files
            .map(async (f: string) => JSON.parse(await fs.promises.readFile(path.join(inputDir, f), 'utf-8')))
        )

        schemas.forEach((schema: any) => {
            this.v.addSchema(schema, schema.$id);
            this.schemas[schema.$id] = schema;
        })

        return this;
    }

    validate(examples: Examples): this {

        // TODO map each example with its schema
        this.v.validate(examples.idJson, this.schemas['identifier'])

        return this
    }
}

(async () => {
    const examples = new Examples();

    // TODO activate validation
    /*
    const validator = await new SchemasValidator().initValidator();
    validator.validate(examples)
     */

    // FIXME use a parameter to choose output dir
    const outputDir = path.join(__dirname, '..', 'temp');

    const dict = examples as unknown as { [typeName: string]: unknown };
    for (let key of Object.keys(examples)) {
        let baseName: string
        let fileBody: string
        if (key.endsWith('Json')) {
            baseName = `${key.replace(/Json$/, '')}.json`;
            fileBody = JSON.stringify(dict[key], null, 2);
        } else if(key.endsWith('Txt')) {
            baseName = `${key.replace(/Txt$/, '')}.txt`;
            fileBody = dict[key] as string;
        } else if(key.endsWith('Http')) {
            baseName = `${key.replace(/Http$/, '')}.http`;
            fileBody = dict[key] as string;
        }

        const fullPath = path.join(outputDir, baseName);
        console.log(fullPath)
        await fs.writeFile(fullPath, fileBody);
    }
})()
