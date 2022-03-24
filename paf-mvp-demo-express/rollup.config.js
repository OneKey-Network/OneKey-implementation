import {join} from 'path';
import {defineConfig} from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';

const relative = path => join(__dirname, path);
// https://rollupjs.org/guide/en/#configuration-files
export default [
  defineConfig({
    input: relative('src/cmp/js/cmp.ts'),
    output: {
      file: relative('public/assets/cmp/cmp.js'),
      format: 'umd',
      name: 'CMP',
      sourcemap: true
    },
    treeshake: 'smallest', // remove unused code
    plugins: [
      typescript({
        tsconfig: relative('src/cmp/js/tsconfig.json')
      }),
      commonjs(),
      nodeResolve(),
      // terser(), // minify js output
    ]
  })
];
