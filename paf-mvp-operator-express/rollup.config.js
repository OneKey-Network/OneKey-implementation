import { join } from 'path';
import { defineConfig } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import nodeResolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const moduleName = `onekey-operator`;

const DEV = process.env.ROLLUP_WATCH;

const DIST = 'dist'; // Because will use typescript "dist" dir
const relative = path => join(__dirname, path);

const getDestFolder = (path) => DIST  + path;
// https://rollupjs.org/guide/en/#configuration-files
export default [
  defineConfig({
    input: relative('src/index.ts'),
    output: {
      file: pkg.main,
      format: 'cjs',
      name: 'PAF',
      sourcemap: DEV !== undefined
    },
    treeshake: 'smallest', // remove unused code
    plugins: [
      typescript({
        tsconfig: relative('../tsconfig.json'),
        sourceMap: DEV !== undefined,
      }),
      json(),
      commonjs(),
      nodeResolve(),
      ...(() => {
        if (DEV) {
          return []
        } else {
          return [
            terser(), // minify js output
          ]
        }
      })(),
    ]
  }),
  defineConfig({
    input: getDestFolder(`/paf-mvp-operator-express/src/index.d.ts`),
    output: {
      file: getDestFolder(`/${moduleName}.d.ts`),
      format: 'es'
    },
    plugins: [dts()]
  })
];
