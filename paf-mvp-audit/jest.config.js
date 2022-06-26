const rootConfig = require('../jest.config');

const path = require('path');

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  ...rootConfig,
  testEnvironment: 'jsdom', 
  globals: {
    ...rootConfig.globals,
    'mock-audit-log-filename': path.join(__dirname, './assets/mocks/audit-log.json'),
  },
};
