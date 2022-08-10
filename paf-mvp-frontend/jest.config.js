const rootConfig = require('../jest.config.subproject-base');

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  ...rootConfig,
  rootDir: __dirname,
	displayName: 'Lib',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    ...rootConfig.moduleNameMapper,
    "\\.(css|less|scss)$": "identity-obj-proxy"
  },
  testPathIgnorePatterns: [
    '<rootDir>/cypress/',
    '<rootDir>/tests/legacy/'
  ],
  setupFiles: [
    '<rootDir>/tests/jest-setup.js'
  ],
};
