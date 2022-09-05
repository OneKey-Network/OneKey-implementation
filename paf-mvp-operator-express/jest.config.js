const rootConfig = require('../jest.config.subproject-base');

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  ...rootConfig,
  displayName: 'Operator',
};
