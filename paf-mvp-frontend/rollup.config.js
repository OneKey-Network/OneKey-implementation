import { join } from 'path';
import { defineConfig } from 'rollup';
import image from '@rollup/plugin-image';
import alias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import serve from 'rollup-plugin-serve';
import preact from 'rollup-plugin-preact';
import styles from 'rollup-plugin-styles';
import { terser } from 'rollup-plugin-terser';
import livereload from 'rollup-plugin-livereload';
import json from '@rollup/plugin-json';

// When developing this project independently of the other projects in the repo
const IS_PROJECT_DEV = process.env.ROLLUP_WATCH !== undefined;

// When developing the demo project, that depends on the frontend project
const IS_DEMO_DEV = process.env.__LOCAL__ === "true"; // This variable is set in nodemon.json of demo project

const IS_DEV = IS_PROJECT_DEV || IS_DEMO_DEV;

const DIST = 'dist';

const relative = path => join(__dirname, path);

// To facilitate debug, generate map files in two situations:
// - local debug in this directory (DEV), where files will be generated locally in dist
// - even when the complete demo app is running (DEV == false), but locally with nodemon (LOCAL == true)
const generateSourceMap = IS_DEV;

// https://rollupjs.org/guide/en/#configuration-files
export default [
  defineConfig({
    input: relative('src/lib/one-key.ts'),
    output: {
      file: `${DIST}/onekey.js`,
      format: 'umd',
      name: 'OneKey',
      sourcemap: generateSourceMap
    },
    treeshake: 'smallest', // remove unused code
    plugins: [
      json(),
      //sourcemaps(),
      typescript({
        tsconfig: relative('../tsconfig.json'),
        inlineSourceMap: generateSourceMap,
        inlineSources: generateSourceMap
      }),
      commonjs(),
      nodeResolve(),
      ...(() => {
        if (IS_DEV) {
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
    input: relative('src/main.ts'), // entry file
    output: {
      file: `${DIST}/app.bundle.js`,
      format: 'umd', // preact-habitat requires "umd" format
      name: 'bundle',
      sourcemap: generateSourceMap
    },
    treeshake: 'recommended', // remove unused code
    plugins: [ // a list of plugins we apply to the source code
      alias({ // create aliases to replace import sources
        entries: [
          {find: 'react', replacement: 'preact/compat'},
          {find: 'react-dom/test-utils', replacement: 'preact/test-utils'},
          {find: 'react-dom', replacement: 'preact/compat'},
          {find: 'react/jsx-runtime', replacement: 'preact/jsx-runtime'}
        ]
      }),
      replace({ // replace value in runtime
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify(IS_DEV ? 'development' : 'production'),
        'env__development': IS_DEV ? 'env__development' : 'env__production' // to import correct env file
      }),
      styles({
        modules: true,
        mode: [
          "inject", { singleTag: true, prepend: true, attributes: { id: 'PAF-styles' } },
        ]
      }),
      image(), // allow to import images into ts code (as base64)
      preact({ // compile preact components to javascript
        usePreactX: false,
        noPropTypes: false,
        noReactIs: false,
        noEnv: false,
        browser: true,
        resolvePreactCompat: true,
      }),
      typescript({
          tsconfig: relative('../tsconfig.json'),
          sourceMap: generateSourceMap,
        }
      ), // compile typescript => js
      ...(() => {
        if (!IS_DEV) { // list of plugins for production
          return [
            terser(), // minify js output
            copy({ // copy files
              targets: [
                {
                  src: `${DIST}/*`,
                  dest: '../paf-mvp-demo-express/public/assets',
                },
              ],
            }),
          ]
        } else if (IS_PROJECT_DEV) { // list of plugins for local project development
          return [
            copy({ // copy files
              targets: [
                {
                  src: './assets/*',
                  dest: DIST,
                },
              ],
            }),
            serve({ // dev server
              contentBase: '',
              headers: {
                'Access-Control-Allow-Origin': '*'
              },
              open: false, // change to true to open browser automatically
              openPage: '/',
              // Set to true to return index.html (200) instead of error page (404)
              historyApiFallback: true,
              host: 'localhost',
              port: 3000,
            }),
            livereload({ // reload the page if any changes
              watch: DIST,
            })
          ]
        } else {
          return [];
        }
      })(),
    ],
  })
];
