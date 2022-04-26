const rootConfig = require('../jest.config');

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  ...rootConfig,
  testEnvironment: 'node'
};
