import { Express } from 'express';
import request from 'supertest';
import { OperatorUtils } from '../utils/operator-utils';
import { JsonValidator } from '@core/validation/json-validator';
import { assertError } from '../helpers/integration.helpers';
import { NodeErrorType } from '@core/errors';

// /!\ for some reason this doesn't work in a beforeAll
// in express-apps.ts, all unsecure requests are redirected to HTTPS, making all tests end up with a 302 status.
// To prevent that, we consider that all requests are secure
jest.mock('@core/express/express-apps', () => {
  const module = jest.requireActual('@core/express/express-apps');
  module.VHostApp.prototype.ensureHttps = () => {
    // No redirect to HTTPS
  };
  return module;
});

// Note: use real JSON validator
const operatorNode = OperatorUtils.buildOperator(JsonValidator.default(), () => Promise.resolve('operatorKey'));

const server: Express = operatorNode.app.expressApp;

describe('read', () => {
  it('should check query string', async () => {
    const response = await request(server).get('/paf/v1/ids-prefs');

    assertError(response, NodeErrorType.INVALID_QUERY_STRING);
  });
});
