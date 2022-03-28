const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('../tsconfig');

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  rootDir: '.',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/../' }),
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.test.json',
    },
  },
  "automock": false,
  "resetMocks": false,
  setupFiles: [
    '<rootDir>/tests/jest-setup.js'
  ]
};
