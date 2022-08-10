const path = require('path');
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest', // TypeScript files are transformed by ts-jest to CommonJS syntax, leaving JavaScript files as-is.
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: __dirname }),
  globals: {
    'ts-jest': {
      tsconfig: path.join(__dirname, 'tsconfig.test.json'),
    },
  },
  'automock': false,
  'resetMocks': false,
};