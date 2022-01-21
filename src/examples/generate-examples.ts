import {
    GetIdPrefsRequest,
    GetIdPrefsResponse,
    GetNewIdRequest,
    GetNewIdResponse,
    Id,
    PostIdPrefsRequest,
    PostIdPrefsResponse,
    Preferences
} from "../../paf-mvp-core-js/src/model/generated-model";
import {advertiser, cmp, operator, publicKeys} from "../config";
import path from "path";
import {OperatorClient} from "../../paf-mvp-operator-client-express/src/operator-client";
import {OperatorApi} from "../../paf-mvp-operator-express/src/operator-api";
import {schemas} from "../../paf-mvp-core-js/src/model/schemas";

const fs = require('fs').promises;

const getTimestamp = (dateString: string) => new Date(dateString).getTime()

class Examples {
    getIdPrefsRequest: GetIdPrefsRequest
    getIdPrefsResponse_known: GetIdPrefsResponse
    getIdPrefsResponse_unknown: GetIdPrefsResponse
    postIdPrefsRequest: PostIdPrefsRequest
    postIdPrefsResponse: PostIdPrefsResponse
    getNewIdRequest: GetNewIdRequest
    getNewIdResponse: GetNewIdResponse
    id: Id
    preferences: Preferences

    constructor() {

        const advertiserClient = new OperatorClient('https', operator.host, advertiser.host, advertiser.privateKey, publicKeys)
        const cmpClient = new OperatorClient('https', operator.host, cmp.host, cmp.privateKey, publicKeys)

        const operatorAPI = new OperatorApi(operator.host, operator.privateKey)

        this.id = operatorAPI.signId("7435313e-caee-4889-8ad7-0acd0114ae3c", getTimestamp("2022/01/18 12:13"));

        this.preferences = cmpClient.buildPreferences(this.id, true, getTimestamp("2022/01/18 12:16"))

        const newId: Id = {
            persisted: false,
            ...operatorAPI.signId("2e71121a-4feb-4a34-b7d1-839587d36390", getTimestamp("2022/01/24 17:19"))
        }

        this.getIdPrefsRequest = advertiserClient.buildGetIdPrefsRequest(getTimestamp("2022/01/24 17:19"))
        this.getIdPrefsResponse_known = operatorAPI.buildGetIdPrefsResponse(advertiser.host, {
            identifiers: [this.id],
            preferences: this.preferences
        }, getTimestamp("2022/01/24 17:19:10"))
        this.getIdPrefsResponse_unknown = operatorAPI.buildGetIdPrefsResponse(advertiser.host, {identifiers: [newId]}, getTimestamp("2022/01/24 17:19:10"))

        this.postIdPrefsRequest = cmpClient.buildPostIdPrefsRequest({
            identifiers: [this.id],
            preferences: this.preferences
        }, getTimestamp("2022/01/25 09:01"))
        this.postIdPrefsResponse = operatorAPI.buildPostIdPrefsResponse(cmp.host, {
            identifiers: [this.id],
            preferences: this.preferences
        }, getTimestamp("2022/01/25 09:01:03"))

        this.getNewIdRequest = cmpClient.buildGetNewIdRequest(getTimestamp("2022/03/01 19:04"))
        this.getNewIdResponse = operatorAPI.buildGetNewIdResponse(cmp.host, newId, getTimestamp("2022/03/01 19:04:47"))
    }

    validate(): this {
        schemas.GetIdPrefsRequest.validate(this.getIdPrefsRequest)
        schemas.GetIdPrefsResponse.validate(this.getIdPrefsResponse_known)
        schemas.GetIdPrefsResponse.validate(this.getIdPrefsResponse_unknown)

        schemas.PostIdPrefsRequest.validate(this.postIdPrefsRequest)
        schemas.PostIdPrefsResponse.validate(this.postIdPrefsResponse)

        schemas.GetNewIdRequest.validate(this.getNewIdRequest)
        schemas.GetNewIdResponse.validate(this.getNewIdResponse)

        return this
    }
}

export const examples = new Examples().validate();

const outputDir = path.join(__dirname, 'generated-examples');

(async () => {
    for (let fileName of Object.keys(examples)) {
        const baseName = `${fileName}.json`;
        const fileBody = JSON.stringify((examples as unknown as { [typeName: string]: unknown })[fileName], null, 2);
        const fullPath = path.join(outputDir, baseName);
        console.log(fullPath)
        await fs.writeFile(fullPath, fileBody);
    }
})()
