// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from '@rollup/plugin-node-resolve';

// Needed to minimize the resulting bundle.
import { terser } from 'rollup-plugin-terser';

// Used to get the locales for embedding into the bundle.
import yaml from '@rollup/plugin-yaml';

// HTML templates used to add language text.
import postHTML from 'rollup-plugin-posthtml-template';

// Embed the CSS into the bundle.
import { string } from 'rollup-plugin-string';

export default {
  input: './src/main.ts',
  plugins: [
    string({ include: ['**/*.css', '**/*.svg'] }),
    postHTML({ template: true }),
    yaml(),
    nodeResolve(),
    commonjs(),
    typescript({
      tsconfig: '../tsconfig.json'
    })
  ],
  treeshake: true,
  output: [
    {
      file: './dist/ok-audit.js',
      format: 'iife',
      sourcemap: true
    },
    {
      file: './dist/ok-audit.min.js',
      format: 'iife',
      sourcemap: true,
      plugins: [
        terser()
      ]
    },
    {
      file: '../paf-mvp-demo-express/public/assets/ok-audit.js',
      format: 'iife',
      sourcemap: true
    },
    {
      file: '../paf-mvp-demo-express/public/assets/ok-audit.min.js',
      format: 'iife',
      sourcemap: true,
      plugins: [
        terser()
      ]
    }
  ]
};
