import {
    GetIdsPrefsRequest,
    GetIdsPrefsResponse,
    GetNewIdRequest,
    GetNewIdResponse,
    Identifier,
    PostIdsPrefsRequest,
    PostIdsPrefsResponse,
    Preferences,
    Identifiers
} from "paf-mvp-core-js/dist/model/generated-model";
import {advertiser, cmp, operator, publicKeys} from "../src/config";
import path from "path";
import {OperatorClient} from "paf-mvp-operator-client-express/dist/operator-client";
import {OperatorApi} from "paf-mvp-operator-express/dist/operator-api";
import {Validator} from "jsonschema";

const fs = require('fs').promises;

const getTimestamp = (dateString: string) => new Date(dateString).getTime()

class Examples {
    getIdsPrefsRequest: GetIdsPrefsRequest
    getIdsPrefsResponse_known: GetIdsPrefsResponse
    getIdsPrefsResponse_unknown: GetIdsPrefsResponse
    postIdsPrefsRequest: PostIdsPrefsRequest
    postIdsPrefsResponse: PostIdsPrefsResponse
    getNewIdRequest: GetNewIdRequest
    getNewIdResponse: GetNewIdResponse
    ids_cookie: string
    ['ids_cookie-pretty']: Identifiers
    id: Identifier
    preferences: Preferences
    ['preferences_cookie-pretty']: Preferences
    preferences_cookie: string

    constructor() {

        const advertiserClient = new OperatorClient('https', operator.host, advertiser.host, advertiser.privateKey, publicKeys)
        const cmpClient = new OperatorClient('https', operator.host, cmp.host, cmp.privateKey, publicKeys)

        const operatorAPI = new OperatorApi(operator.host, operator.privateKey)

        this.id = operatorAPI.signId("7435313e-caee-4889-8ad7-0acd0114ae3c", getTimestamp("2022/01/18 12:13"));
        this['ids_cookie-pretty'] = [this.id]
        this.ids_cookie = JSON.stringify(this['ids_cookie-pretty'])

        this.preferences = cmpClient.buildPreferences(this.id, true, getTimestamp("2022/01/18 12:16"))
        this['preferences_cookie-pretty'] = this.preferences
        this.preferences_cookie = JSON.stringify(this['preferences_cookie-pretty'])

        const newId: Identifier = {
            persisted: false,
            ...operatorAPI.signId("2e71121a-4feb-4a34-b7d1-839587d36390", getTimestamp("2022/01/24 17:19"))
        }

        this.getIdsPrefsRequest = advertiserClient.buildGetIdsPrefsRequest(getTimestamp("2022/01/24 17:19"))
        this.getIdsPrefsResponse_known = operatorAPI.buildGetIdsPrefsResponse(advertiser.host, {
            identifiers: [this.id],
            preferences: this.preferences
        }, getTimestamp("2022/01/24 17:19:10"))
        this.getIdsPrefsResponse_unknown = operatorAPI.buildGetIdsPrefsResponse(advertiser.host, {identifiers: [newId]}, getTimestamp("2022/01/24 17:19:10"))

        this.postIdsPrefsRequest = cmpClient.buildPostIdsPrefsRequest({
            identifiers: [this.id],
            preferences: this.preferences
        }, getTimestamp("2022/01/25 09:01"))
        this.postIdsPrefsResponse = operatorAPI.buildPostIdsPrefsResponse(cmp.host, {
            identifiers: [this.id],
            preferences: this.preferences
        }, getTimestamp("2022/01/25 09:01:03"))

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
        } else {
            baseName = `${key}.txt`;
            fileBody = dict[key] as string;
        }
        const fullPath = path.join(outputDir, baseName);
        console.log(fullPath)
        await fs.writeFile(fullPath, fileBody);
    }
})()
