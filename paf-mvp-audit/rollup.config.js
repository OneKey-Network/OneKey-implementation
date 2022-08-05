// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

// Needed to minimize the resulting bundle.
import { terser } from 'rollup-plugin-terser';

// Used to get the locales for embedding into the bundle.
import yaml from '@rollup/plugin-yaml';

// HTML templates used to add language text.
import postHTML from 'rollup-plugin-posthtml-template';

// Embed the CSS into the bundle.
import { string } from 'rollup-plugin-string';
import livereload from 'rollup-plugin-livereload';
import copy from 'rollup-plugin-copy';
import serve from 'rollup-plugin-serve';

// When developing the "frontend" project independently of the other projects
const IS_PROJECT_DEV = process.env.ROLLUP_WATCH !== undefined;

const DIST = 'dist';

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
    }),
    ...(() => {
      if (IS_PROJECT_DEV) { // list of plugins for local project development
        return [
          copy({ // copy PAF-lib files to have them locally for tests
            targets: [
              {
                src: '../paf-mvp-frontend/dist/*',
                dest: DIST
              }
            ]
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
            port: 3000
          }),
          livereload({ // reload the page if any changes
            watch: DIST
          })
        ];
      } else {
        return [];
      }
    })()
  ],
  treeshake: true,
  output: [
    {
      file: `${DIST}/ok-audit.js`,
      format: 'iife',
      sourcemap: true
    },
    {
      file: `${DIST}/ok-audit.min.js`,
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
