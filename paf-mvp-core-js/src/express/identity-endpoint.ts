import {KeyInfo} from '@core/crypto/identity';
import {participantEndpoints} from '@core/endpoints';
import {corsOptionsAcceptAll} from '@core/express/utils';
import cors from 'cors';
import {Express} from 'express';
import {GetIdentityResponseBuilder} from '@core/model/identity-response-builder';

export const addIdentityEndpoint = (app: Express, name: string, type: 'vendor' | 'operator', keys: KeyInfo[]) => {
    const response = new GetIdentityResponseBuilder(name, type).buildResponse(keys);

    app.get(participantEndpoints.identity, cors(corsOptionsAcceptAll), (req, res) => {
        res.send(response);
    });
};
