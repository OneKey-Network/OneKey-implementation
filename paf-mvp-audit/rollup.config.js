// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from '@rollup/plugin-node-resolve';

// Used to ensure the resulting bundle will run on the widest variety of web 
// browsers.
import babel from '@rollup/plugin-babel';

// Needed to minimize the resulting bundle.
import { terser } from 'rollup-plugin-terser';

// Used to get the locales for embedding into the bundle.
import yaml from '@rollup/plugin-yaml';

// HTML templates used to add language text.
import postHTML from 'rollup-plugin-posthtml-template';

// Reduces the size of the HTML.
import minifyHTML from 'rollup-plugin-minify-html-literals';

// Embed the CSS into the bundle.
import { string } from 'rollup-plugin-string';

export default {
  input: './src/main.ts',
  treeshake: 'smallest', // remove unused code
  plugins: [
    commonjs(),
    nodeResolve(),
    postHTML({ template: true }),
    minifyHTML(),
    string({ include: ['**/*.css', '**/*.svg', '**/*.js'] }),
    typescript({
      sourceMap: true,
      tsconfig: './tsconfig.json'
    }),
    babel({
      exclude: ['node_modules/**', 'dist/**'],
      babelHelpers: 'bundled'
    }),
    yaml()
  ],
  output: [
    {
      file: './dist/ok-ui.js',
      format: 'iife',
      name: 'PAF'
    },
    {
      file: './dist/ok-ui.min.js',
      format: 'iife',
      name: 'PAF',
      plugins: [
        terser()
      ]
    },
    {
      file: '../paf-mvp-demo-express/public/assets/cmp/ok-ui.js',
      format: 'iife',
      name: 'PAF'
    },
  ]
};