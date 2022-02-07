import {
    GetIdsPrefsRequest,
    GetIdsPrefsResponse,
    RedirectGetIdsPrefsRequest,
    GetNewIdRequest,
    GetNewIdResponse,
    Identifier,
    PostIdsPrefsRequest,
    RedirectPostIdsPrefsRequest,
    PostIdsPrefsResponse,
    Preferences,
    Identifiers
} from "paf-mvp-core-js/dist/model/generated-model";
import {toIdsCookie, toPrefsCookie} from "paf-mvp-core-js/dist/cookies";
import {advertiser, cmp, operator, publicKeys} from "../src/config";
import path from "path";
import {OperatorClient} from "paf-mvp-operator-client-express/dist/operator-client";
import {GetIdsPrefsURLBuilder, PostIdsPrefsURLBuilder} from "paf-mvp-operator-client-express/dist/url-builders";
import {OperatorApi} from "paf-mvp-operator-express/dist/operator-api";
import {Validator} from "jsonschema";

const fs = require('fs').promises;

const getTimestamp = (dateString: string) => new Date(dateString).getTime() / 1000
const getGetUrl = (url: URL): string => `GET ${url}`
const getPOSTUrl = (url: URL): string => `POST ${url}`

class Examples {
    // **************************** Main data
    id: Identifier
    preferences: Preferences

    // **************************** Cookies
    // JSON version
    ['ids_cookie-pretty']: Identifiers
    // Stringified version
    ids_cookie: string

    // JSON version
    ['preferences_cookie-pretty']: Preferences
    // Stringified version
    preferences_cookie: string

    // **************************** Read
    getIdsPrefsRequest: GetIdsPrefsRequest
    getIdsPrefs_in: string
    getIdsPrefsResponse_known: GetIdsPrefsResponse // TODO redirect version
    getIdsPrefsResponse_unknown: GetIdsPrefsResponse // TODO redirect version

    redirectGetIdsPrefsRequest: RedirectGetIdsPrefsRequest
    redirectGetIdsPrefs_in: string // TODO redirect out

    // **************************** Write
    postIdsPrefsRequest: PostIdsPrefsRequest
    postIdsPrefs_in: string // TODO redirect out

    redirectPostIdsPrefsRequest: RedirectPostIdsPrefsRequest
    redirectPostIdsPrefs_in: string

    postIdsPrefsResponse: PostIdsPrefsResponse // TODO redirect version

    // **************************** Get new ID
    getNewIdRequest: GetNewIdRequest
    getNewIdResponse: GetNewIdResponse

    // **************************** Verify 3PC // TODO

    // **************************** Identity // TODO

    constructor() {
        const operatorAPI = new OperatorApi(operator.host, operator.privateKey)
        const originalAdvertiserUrl = `https://${advertiser.host}/news/2022/02/07/something-crazy-happened?utm_content=campaign%20content`

        const newId: Identifier = {
            persisted: false,
            ...operatorAPI.signId("2e71121a-4feb-4a34-b7d1-839587d36390", getTimestamp("2022/01/24 17:19"))
        }

        // **************************** Main data
        this.id = operatorAPI.signId("7435313e-caee-4889-8ad7-0acd0114ae3c", getTimestamp("2022/01/18 12:13"));

        const cmpClient = new OperatorClient('https', operator.host, cmp.host, cmp.privateKey, publicKeys)
        this.preferences = cmpClient.buildPreferences(this.id, true, getTimestamp("2022/01/18 12:16"))

        // **************************** Cookies
        this['ids_cookie-pretty'] = [this.id]
        this.ids_cookie = toIdsCookie(this['ids_cookie-pretty'])

        this['preferences_cookie-pretty'] = this.preferences
        this.preferences_cookie = toPrefsCookie(this['preferences_cookie-pretty'])

        // **************************** Read
        const getIdsURLBuilder = new GetIdsPrefsURLBuilder('https', operator.host, cmp.host, cmp.privateKey)
        this.getIdsPrefsRequest = getIdsURLBuilder.buildRequest(getTimestamp("2022/01/24 17:19"))
        this.getIdsPrefs_in = getGetUrl(getIdsURLBuilder.getRestUrl(this.getIdsPrefsRequest))
        this.getIdsPrefsResponse_known = operatorAPI.buildGetIdsPrefsResponse(advertiser.host, {
            identifiers: [this.id],
            preferences: this.preferences
        }, getTimestamp("2022/01/24 17:19:10"))
        this.getIdsPrefsResponse_unknown = operatorAPI.buildGetIdsPrefsResponse(advertiser.host, {identifiers: [newId]}, getTimestamp("2022/01/24 17:19:10"))

        this.redirectGetIdsPrefsRequest = getIdsURLBuilder.toRedirectRequest(this.getIdsPrefsRequest, originalAdvertiserUrl)
        this.redirectGetIdsPrefs_in = getGetUrl(getIdsURLBuilder.getRedirectUrl(this.redirectGetIdsPrefsRequest))

        // **************************** Write
        const postIdsURLBuilder = new PostIdsPrefsURLBuilder('https', operator.host, cmp.host, cmp.privateKey)
        this.postIdsPrefsRequest = cmpClient.buildPostIdsPrefsRequest({
            identifiers: [this.id],
            preferences: this.preferences
        }, getTimestamp("2022/01/25 09:01"))
        this.postIdsPrefs_in = getPOSTUrl(postIdsURLBuilder.getRestUrl(this.postIdsPrefsRequest)) // Notice is POST url
        this.postIdsPrefsResponse = operatorAPI.buildPostIdsPrefsResponse(cmp.host, {
            identifiers: [this.id],
            preferences: this.preferences
        }, getTimestamp("2022/01/25 09:01:03"))

        this.redirectPostIdsPrefsRequest = postIdsURLBuilder.toRedirectRequest(this.postIdsPrefsRequest, originalAdvertiserUrl)
        this.redirectPostIdsPrefs_in = getGetUrl(postIdsURLBuilder.getRedirectUrl(this.redirectPostIdsPrefsRequest))

        // **************************** Get new ID
        this.getNewIdRequest = cmpClient.buildGetNewIdRequest(getTimestamp("2022/03/01 19:04"))
        this.getNewIdResponse = operatorAPI.buildGetNewIdResponse(cmp.host, newId, getTimestamp("2022/03/01 19:04:47"))

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
        this.v.validate(examples.id, this.schemas['identifier'])

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
        if (typeof dict[key] === 'object') {
            baseName = `${key}.json`;
            fileBody = JSON.stringify(dict[key], null, 2);
        } else if(key.endsWith('_cookie')) {
            baseName = `${key}.txt`;
            fileBody = dict[key] as string;
        } else if(key.endsWith('_in') || key.endsWith('_out')) {
            baseName = `${key}.http`;
            fileBody = dict[key] as string;
        }

        const fullPath = path.join(outputDir, baseName);
        console.log(fullPath)
        await fs.writeFile(fullPath, fileBody);
    }
})()
