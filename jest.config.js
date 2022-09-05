const path = require('path');
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  projects: [
    'paf-mvp-audit/jest.config.js',
    'paf-mvp-client-express/jest.config.js',
    'paf-mvp-cmp/jest.config.js',
    'paf-mvp-core-js/jest.config.js',
    'paf-mvp-frontend/jest.config.js',
    'paf-mvp-operator-express/jest.config.js',

    // 'paf-mvp-demo-express/jest.config.js', // No test for now.
    // 'paf-mvp-patterns-library/jest.config.js', // No test for now.
    // 'paf-mvp-patterns-library-audit/jest.config.js', // No test for now.
	],
  // collectCoverageFrom
  // CollectCoverage = false by design. Call 'jest --coverage'.
  // collectCoverageFrom defined at root level as a workaround:  https://github.com/facebook/jest/issues/9628
  // For some reason relative pathes don't work.
  "collectCoverageFrom": [
    "**/src/**",

    "!**/src/components/**", // Hack to remove "paf-mvp-frontend/src/components/" because relative path doesn't work.
    "!**/src/containers/**", // Hack to remove "paf-mvp-frontend/src/containers/" because relative path doesn't work
    '!**/**/fixtures/**/*.js',
    '!**/**/test-setup.js',
    '!**/**/*.spec.js',
    '!**/**/*.mock.js',
    '!**/**/*.test.js',
    "!**/*.d.ts",
    "!**/**/(index|main).(ts|js)", // Exclude index files that are only setup and configuration.
  ],
};
