const rootConfig = require('../jest.config');

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  ...rootConfig,
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    ...rootConfig.moduleNameMapper,
    "\\.(css|less|scss)$": "identity-obj-proxy"
  },
  testPathIgnorePatterns: [
    '/cypress/'
  ],
  setupFiles: [
    '<rootDir>/tests/jest-setup.js'
  ]
};
