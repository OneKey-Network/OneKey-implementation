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
    PostSignPreferencesRequest,
    PostIdsPrefsRequest,
    PostIdsPrefsResponse,
    Preferences,
    RedirectGetIdsPrefsRequest,
    RedirectGetIdsPrefsResponse,
    RedirectPostIdsPrefsRequest,
    RedirectPostIdsPrefsResponse,
    Test3Pc, IdsAndPreferences
} from "@core/model/generated-model";
import {toIdsCookie, toPrefsCookie, toTest3pcCookie} from "@core/cookies";
import {getTimeStampInSec} from "@core/timestamp";
import {advertiser, cmp, operator, publisher} from "../src/config";
import path from "path";
import {OperatorClient} from "@operator-client/operator-client";
import {
    Get3PCRequestBuilder,
    GetIdentityRequestBuilder,
    GetIdsPrefsRequestBuilder,
    GetNewIdRequestBuilder,
    PostIdsPrefsRequestBuilder
} from "@core/model/operator-request-builders";
import {OperatorApi} from "@operator/operator-api";
import {
    Get3PCResponseBuilder,
    GetIdentityResponseBuilder,
    GetIdsPrefsResponseBuilder,
    GetNewIdResponseBuilder,
    PostIdsPrefsResponseBuilder
} from "@core/model/operator-response-builders";
import {Validator} from "jsonschema";
import {publicKeys} from "../src/public-keys";
import * as fs from "fs";
import {
    ProxyRestSignPostIdsPrefsRequestBuilder,
    ProxyRestSignPreferencesRequestBuilder,
    ProxyRestVerifyGetIdsPrefsRequestBuilder
} from "@core/model/proxy-request-builders";

const getTimestamp = (dateString: string) => getTimeStampInSec(new Date(dateString))
const getUrl = (method: "POST" | "GET", url: URL): string => `${method} ${url.pathname}${url.search}\nHost: ${url.host}`
const getGETUrl = (url: URL): string => getUrl("GET", url)
const getPOSTUrl = (url: URL): string => getUrl("POST", url)
const getRedirect = (url: URL): string => `303 ${url}`

if (!(process.argv[2]?.length > 0)) {
    const scriptName = path.basename(__filename);
    console.error(`Usage: ts-node -r tsconfig-paths/register ${scriptName} <outputDir>
Example: ts-node -r tsconfig-paths/register ${scriptName} ../../../addressable-network-proposals/mvp-spec/partials`)
    process.exit(1)
}

const outputDir = path.join(process.cwd(), process.argv[2]);

if (!fs.existsSync(outputDir)) {
    throw `Output dir not found: "${outputDir}"`
}

// The examples are not supposed to look like a demo but a real environment
operator.host = 'operator.paf-operation-domain.io'
cmp.host = 'cmp.com'
advertiser.host = 'advertiser.com'
publisher.host = 'publisher.com'

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

    // JSON version
    ['test_3pc_cookie-prettyJson']: Test3Pc
    // Stringified version
    test_3pc_cookieTxt: string

    // **************************** Read
    getIdsPrefsRequestJson: GetIdsPrefsRequest
    getIdsPrefsRequestHttp: string

    getIdsPrefsResponse_knownJson: GetIdsPrefsResponse
    getIdsPrefsResponse_unknownJson: GetIdsPrefsResponse

    redirectGetIdsPrefsRequestJson: RedirectGetIdsPrefsRequest
    redirectGetIdsPrefsRequestHttp: string

    redirectGetIdsPrefsResponse_knownJson: RedirectGetIdsPrefsResponse
    redirectGetIdsPrefsResponse_knownTxt: string
    redirectGetIdsPrefsResponse_unknownJson: RedirectGetIdsPrefsResponse
    redirectGetIdsPrefsResponse_unknownTxt: string

    // **************************** Write
    postIdsPrefsRequestJson: PostIdsPrefsRequest
    postIdsPrefsRequestHttp: string

    postIdsPrefsResponseJson: PostIdsPrefsResponse

    redirectPostIdsPrefsRequestJson: RedirectPostIdsPrefsRequest
    redirectPostIdsPrefsRequestHttp: string
    redirectPostIdsPrefsResponseJson: RedirectPostIdsPrefsResponse
    redirectPostIdsPrefsResponseTxt: string

    // **************************** Get new ID
    getNewIdRequestJson: GetNewIdRequest
    getNewIdRequestHttp: string

    getNewIdResponseJson: GetNewIdResponse

    // **************************** Verify 3PC
    get3pcRequestHttp: string
    get3pcResponse_supportedJson: Get3PcResponse
    get3pcResponse_unsupportedJson: Error

    // **************************** Identity
    getIdentityRequest_operatorHttp: string
    getIdentityResponse_operatorJson: GetIdentityResponse

    getIdentityRequest_cmpHttp: string
    getIdentityResponse_cmpJson: GetIdentityResponse

    // **************************** Proxy
    signPreferencesHttp: string
    signPreferencesJson: PostSignPreferencesRequest
    signPostIdsPrefsHttp: string
    signPostIdsPrefsJson: IdsAndPreferences
    verifyGetIdsPrefsHttp: string
    verifyGetIdsPrefs_invalidJson: Error

    constructor() {
        const operatorAPI = new OperatorApi(operator.host, operator.privateKey)
        const originalAdvertiserUrl = new URL(`https://${advertiser.host}/news/2022/02/07/something-crazy-happened?utm_content=campaign%20content`)

        const newId: Identifier = {
            persisted: false,
            ...operatorAPI.signId("2e71121a-4feb-4a34-b7d1-839587d36390", getTimestamp("2022/01/24 17:19"))
        }

        // **************************** Main data
        this.idJson = operatorAPI.signId("7435313e-caee-4889-8ad7-0acd0114ae3c", getTimestamp("2022/01/18 12:13"));

        const cmpClient = new OperatorClient(operator.host, cmp.host, cmp.privateKey, publicKeys)
        this.preferencesJson = cmpClient.buildPreferences([this.idJson], {use_browsing_for_personalization: true}, getTimestamp("2022/01/18 12:16"))

        // **************************** Cookies
        this['ids_cookie-prettyJson'] = [this.idJson]
        this.ids_cookieTxt = toIdsCookie(this['ids_cookie-prettyJson'])

        this['preferences_cookie-prettyJson'] = this.preferencesJson
        this.preferences_cookieTxt = toPrefsCookie(this['preferences_cookie-prettyJson'])

        this['test_3pc_cookie-prettyJson'] = {
            timestamp: getTimestamp("2022/01/26 17:24")
        }
        this.test_3pc_cookieTxt = toTest3pcCookie(this['test_3pc_cookie-prettyJson'])

        // **************************** Read
        const getIdsPrefsRequestBuilder = new GetIdsPrefsRequestBuilder(operator.host, cmp.host, cmp.privateKey)
        const getIdsPrefsResponseBuilder = new GetIdsPrefsResponseBuilder(operator.host, cmp.privateKey)
        this.getIdsPrefsRequestJson = getIdsPrefsRequestBuilder.buildRequest(getTimestamp("2022/01/24 17:19"))
        this.getIdsPrefsRequestHttp = getGETUrl(getIdsPrefsRequestBuilder.getRestUrl(this.getIdsPrefsRequestJson))
        this.getIdsPrefsResponse_knownJson = getIdsPrefsResponseBuilder.buildResponse(
            advertiser.host,
            {
                identifiers: [this.idJson],
                preferences: this.preferencesJson
            },
            getTimestamp("2022/01/24 17:19:10"))
        this.getIdsPrefsResponse_unknownJson = getIdsPrefsResponseBuilder.buildResponse(
            advertiser.host,
            {
                identifiers: [newId]
            },
            getTimestamp("2022/01/24 17:19:10")
        )

        this.redirectGetIdsPrefsRequestJson = getIdsPrefsRequestBuilder.toRedirectRequest(this.getIdsPrefsRequestJson, originalAdvertiserUrl)
        this.redirectGetIdsPrefsRequestHttp = getGETUrl(getIdsPrefsRequestBuilder.getRedirectUrl(this.redirectGetIdsPrefsRequestJson))

        this.redirectGetIdsPrefsResponse_knownJson = getIdsPrefsResponseBuilder.toRedirectResponse(this.getIdsPrefsResponse_knownJson, 200)
        this.redirectGetIdsPrefsResponse_knownTxt = getRedirect(getIdsPrefsResponseBuilder.getRedirectUrl(originalAdvertiserUrl, this.redirectGetIdsPrefsResponse_knownJson))
        this.redirectGetIdsPrefsResponse_unknownJson = getIdsPrefsResponseBuilder.toRedirectResponse(this.getIdsPrefsResponse_unknownJson, 200)
        this.redirectGetIdsPrefsResponse_unknownTxt = getRedirect(getIdsPrefsResponseBuilder.getRedirectUrl(originalAdvertiserUrl, this.redirectGetIdsPrefsResponse_unknownJson))

        // **************************** Write
        const postIdsPrefsRequestBuilder = new PostIdsPrefsRequestBuilder(operator.host, cmp.host, cmp.privateKey)
        const postIdsPrefsResponseBuilder = new PostIdsPrefsResponseBuilder(operator.host, cmp.privateKey)
        this.postIdsPrefsRequestJson = postIdsPrefsRequestBuilder.buildRequest({
            identifiers: [this.idJson],
            preferences: this.preferencesJson
        }, getTimestamp("2022/01/25 09:01"))
        this.postIdsPrefsRequestHttp = getPOSTUrl(postIdsPrefsRequestBuilder.getRestUrl()) // Notice is POST url
        this.postIdsPrefsResponseJson = postIdsPrefsResponseBuilder.buildResponse(cmp.host, {
            identifiers: [this.idJson],
            preferences: this.preferencesJson
        }, getTimestamp("2022/01/25 09:01:03"))

        this.redirectPostIdsPrefsRequestJson = postIdsPrefsRequestBuilder.toRedirectRequest(this.postIdsPrefsRequestJson, originalAdvertiserUrl)
        this.redirectPostIdsPrefsRequestHttp = getGETUrl(postIdsPrefsRequestBuilder.getRedirectUrl(this.redirectPostIdsPrefsRequestJson))
        this.redirectPostIdsPrefsResponseJson = postIdsPrefsResponseBuilder.toRedirectResponse(this.postIdsPrefsResponseJson, 200)
        this.redirectPostIdsPrefsResponseTxt = getRedirect(postIdsPrefsResponseBuilder.getRedirectUrl(originalAdvertiserUrl, this.redirectPostIdsPrefsResponseJson))

        // **************************** Get new ID
        const getNewIdRequestBuilder = new GetNewIdRequestBuilder(operator.host, cmp.host, cmp.privateKey)
        const getNewIdResponseBuilder = new GetNewIdResponseBuilder(operator.host, operator.privateKey)
        this.getNewIdRequestJson = getNewIdRequestBuilder.buildRequest(getTimestamp("2022/03/01 19:04"))
        this.getNewIdRequestHttp = getGETUrl(getNewIdRequestBuilder.getRestUrl(this.getNewIdRequestJson))

        this.getNewIdResponseJson = getNewIdResponseBuilder.buildResponse(cmp.host, newId, getTimestamp("2022/03/01 19:04:47"))

        // **************************** Verify 3PC
        const get3PCRequestBuilder = new Get3PCRequestBuilder(operator.host, cmp.host, cmp.privateKey)
        const get3PCResponseBuilder = new Get3PCResponseBuilder(operator.host, operator.privateKey)
        this.get3pcRequestHttp = getGETUrl(get3PCRequestBuilder.getRestUrl())

        this.get3pcResponse_supportedJson = get3PCResponseBuilder.buildResponse(this["test_3pc_cookie-prettyJson"]) as Get3PcResponse
        this.get3pcResponse_unsupportedJson = get3PCResponseBuilder.buildResponse(undefined) as Error

        // **************************** Identity
        const getIdentityRequestBuilder_operator = new GetIdentityRequestBuilder(operator.host, advertiser.host, cmp.privateKey)
        const getIdentityResponseBuilder_operator = new GetIdentityResponseBuilder(operator.host, operator.privateKey, operator.name, operator.type)
        this.getIdentityRequest_operatorHttp = getGETUrl(getIdentityRequestBuilder_operator.getRestUrl(undefined))
        this.getIdentityResponse_operatorJson = getIdentityResponseBuilder_operator.buildResponse([
            {
                publicKey: operator.publicKey,
                start: new Date("2022/01/01 11:50"),
                end: new Date("2022/03/01 12:00")
            }
        ])

        // TODO add examples with multiple keys
        const getIdentityRequestBuilder_cmp = new GetIdentityRequestBuilder(cmp.host, advertiser.host, cmp.privateKey)
        const getIdentityResponseBuilder_cmp = new GetIdentityResponseBuilder(cmp.host, cmp.privateKey, cmp.name, cmp.type)
        this.getIdentityRequest_cmpHttp = getGETUrl(getIdentityRequestBuilder_cmp.getRestUrl(undefined))
        this.getIdentityResponse_cmpJson = getIdentityResponseBuilder_cmp.buildResponse([
            {
                publicKey: cmp.publicKey,
                start: new Date("2022/01/15 11:50")
            }
        ])

        // **************************** Proxy
        const signPreferencesRequestBuilder = new ProxyRestSignPreferencesRequestBuilder(cmp.host)
        this.signPreferencesHttp = getPOSTUrl(signPreferencesRequestBuilder.getRestUrl(undefined)) // Notice is POST url
        this.signPreferencesJson = signPreferencesRequestBuilder.buildRequest([this.idJson], {use_browsing_for_personalization: true})

        const signPostIdsPrefsRequestBuilder = new ProxyRestSignPostIdsPrefsRequestBuilder(cmp.host)
        this.signPostIdsPrefsHttp = getPOSTUrl(signPostIdsPrefsRequestBuilder.getRestUrl(undefined)) // Notice is POST url
        this.signPostIdsPrefsJson = signPostIdsPrefsRequestBuilder.buildRequest([this.idJson], this.preferencesJson)

        const verifyGetIdsPrefsRequestBuilder = new ProxyRestVerifyGetIdsPrefsRequestBuilder(cmp.host)
        this.verifyGetIdsPrefsHttp = getPOSTUrl(verifyGetIdsPrefsRequestBuilder.getRestUrl(undefined)) // Notice is POST url
        this.verifyGetIdsPrefs_invalidJson = {message: 'Invalid signature'}
    }
}

class SchemasValidator {

    private v = new Validator();
    private schemas: { [id: string]: any } = {}

    async initValidator(): Promise<this> {

        // FIXME use a parameter to validate examples. Or ignore validation
        const inputDir = path.join(__dirname, '..', '..', 'paf-mvp-core-js', 'json-schemas');
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

    const dict = examples as unknown as { [typeName: string]: unknown };
    for (let key of Object.keys(examples)) {
        let baseName: string
        let fileBody: string
        if (key.endsWith('Json')) {
            baseName = `${key.replace(/Json$/, '')}.json`;
            fileBody = JSON.stringify(dict[key], null, 2);
        } else if (key.endsWith('Txt')) {
            baseName = `${key.replace(/Txt$/, '')}.txt`;
            fileBody = dict[key] as string;
        } else if (key.endsWith('Http')) {
            baseName = `${key.replace(/Http$/, '')}.http`;
            fileBody = dict[key] as string;
        }

        const fullPath = path.join(outputDir, baseName);
        console.log(fullPath)
        await fs.promises.writeFile(fullPath, fileBody);
    }
})()
