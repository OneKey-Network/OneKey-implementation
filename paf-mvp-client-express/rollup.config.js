import { join } from 'path';
import { defineConfig } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';
import ts from 'rollup-plugin-ts';
import { builtinModules } from 'module';

const DEV = process.env.ROLLUP_WATCH;
const relative = path => join(__dirname, path);
const tsconfig = relative('../tsconfig.json');

// https://rollupjs.org/guide/en/#configuration-files
export default [
  defineConfig({
    input: relative('src/index.ts'),
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: DEV !== undefined
      },
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: DEV !== undefined
      }
    ],
    treeshake: 'smallest', // remove unused code
    plugins: [
      ts({
        tsconfig: {
          fileName: tsconfig,
          hook: resolvedConfig => ({ ...resolvedConfig, declaration: true })
        }
      }),
      json(),
      commonjs(),
      nodeResolve(),
      ...(() => {
        if (DEV) {
          return [];
        } else {
          return [
            terser() // minify js output
          ];
        }
      })()
    ],
    // Ignore all npm dependencies
    external: [
      ...builtinModules,
      ...(pkg.dependencies == null ? [] : Object.keys(pkg.dependencies)),
      ...(pkg.devDependencies == null ? [] : Object.keys(pkg.devDependencies)),
      ...(pkg.peerDependencies == null ? [] : Object.keys(pkg.peerDependencies))
    ]
  })
];
