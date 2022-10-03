import path, { join } from 'path';
import { defineConfig } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';
import { builtinModules } from 'module';
import dts from 'rollup-plugin-dts';
import typescript from 'rollup-plugin-typescript2';
import typescriptPaths from 'rollup-plugin-typescript-paths';

const DEV = process.env.ROLLUP_WATCH;
const relative = path => join(__dirname, path);

const entryPath = relative('src/index.ts');

// https://rollupjs.org/guide/en/#configuration-files
export default [
  defineConfig(
    {
      input: {
        index: entryPath,
      },
      plugins: [dts()], // Generate type declaration file index.d.ts
      output: {
        dir: path.dirname(pkg.types),
        format: 'es'
      }
    }),
  defineConfig({
    input: entryPath,
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
      typescriptPaths(),
      typescript(),
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
