const rootConfig = require('../jest.config');

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  ...rootConfig,
  testEnvironment: 'jsdom',
  setupFiles: [
    '<rootDir>/tests/jest-setup.js'
  ]
};
