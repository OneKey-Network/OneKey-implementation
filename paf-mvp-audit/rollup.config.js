// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from '@rollup/plugin-node-resolve';

// Needed to minimize the resulting bundle.
import { terser } from 'rollup-plugin-terser';

// HTML templates used to add language text.
import postHTML from 'rollup-plugin-posthtml-template';

// Reduces the size of the HTML.
import minifyHTML from 'rollup-plugin-minify-html-literals';
import { defaultShouldMinify } from 'minify-html-literals';

// Embed the CSS into the bundle.
import { string } from 'rollup-plugin-string';

// Used to set the locale for each of the bundles.
import replace from '@rollup/plugin-replace';

// Needed for crypto and http functions of the audit viewer.
import json from '@rollup/plugin-json';
import globals from 'rollup-plugin-node-globals';
import nodePolyfills from 'rollup-plugin-node-polyfills';

// Used to get the locales available for each of the bundles.
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

// File name prefix for the bundle files.
const namePrefix = 'ok-ui-audit';

// The name of the root namespace.
const globalName = 'OKA';

const DEV = process.env.ROLLUP_WATCH;

// Options to pass to terser.
const terserOptions = {
  toplevel: true,
  format: {
    comments: false
  },
  compress: true,
  mangle: true
};

// Get mock audit log JSON.
function getMockAuditLogs() {
  const mocks = new Map();
  const directory = './assets/mocks';
  fs.readdirSync(directory).forEach(mockFile => {
    if (path.extname(mockFile) === '.json') {
      const mockName = mockFile.split('.')[0];
      mocks[mockName] = JSON.parse(fs.readFileSync(path.join(directory, mockFile), 'utf8'));
    }
  });
  return mocks;
}

// Adds the SVG images to the local. Could be expanded to support other images in the future.
function addImages(locale) {
  const directory = './src/images';
  fs.readdirSync(directory).forEach(imageFile => {
    if (path.extname(imageFile) === '.svg') {
      const imageName = imageFile.split('.')[0];
      locale[imageName] = fs.readFileSync(path.join(directory, imageFile), 'utf8')
    }
  });
  return locale;
}

// Converts the list of strings to paragraph tags.
function toHtml(list) { return `<p>${list.join('</p><p>')}</p>`; }

// Converts the list of strings to a text block.
function toText(list) { return list.join('\r\n'); }

// Converts the source locale into one with HTML properties.
function addHTML(locale) {
  locale.emailBodyText = toText(locale.emailBody);
  locale.participantsIntroHTML = toHtml(locale.participantsIntro);
  locale.participantsFooterHTML = toHtml(locale.participantsFooter);
  locale.advertGoodBodyHTML = toHtml(locale.advertGoodBody);
  locale.advertSuspiciousBodyHTML = toHtml(locale.advertSuspiciousBody);
  locale.advertViolationBodyHTML = toHtml(locale.advertViolationBody);
  locale.advertInProgressBodyHTML = toHtml(locale.advertInProgressBody);
  locale.downloadBodyHTML = toHtml(locale.downloadBody);
  delete locale['emailBody'];
  delete locale['participantsIntro'];
  delete locale['participantsFooter'];
  delete locale['advertGoodBody'];
  delete locale['advertSuspiciousBody'];
  delete locale['advertViolationBody'];
  delete locale['advertInProgressBody'];
  delete locale['downloadBody'];
  return locale;
}

// Converts the source locale into one with HTML and image properties.
function buildLocale(locale) {
  locale = addHTML(locale);
  locale = addImages(locale);
  return locale;
}

// Gets all the locale files as an array.
function getLocaleFiles() {
  const directory = './src/locales';
  const localeFiles = [];
  fs.readdirSync(directory).forEach(localeFile => {
    if (path.extname(localeFile) === '.yaml') {
      localeFiles.push(localeFile);
    }
  });
  return localeFiles;
}

// Get the locale and the text as JSON.
async function getLocales() {
  const directory = './src/locales';
  const locales = new Map();
  getLocaleFiles().forEach(localeFile => {
    const language = localeFile.split('.')[0];
    const locale = buildLocale(yaml.load(fs.readFileSync(path.join(directory, localeFile), 'utf8')));
    const text = JSON.stringify(locale);
    locales.set(language, text);
  });
  if (locales.size == 0) {
    throw 'No locale files found. Check the "/src/locales" folder.';
  }
  return locales;
}

// Gets the available locale codes for use with the loader.
function getLocaleCodes() {
  const locales = [];
  getLocaleFiles().forEach(localeFile => {
    const locale = localeFile.split('.')[0];
    locales.push('\'' + locale.toLowerCase() + '\'');
  });
  return locales;
}

// Builds the loader working out from the locales directory the various options that will be available.
function buildLoader() {
  const loader = '../paf-mvp-core-js/src/ui/loader.ts';
  return {
    input: loader,
    plugins: [
      replace({
        include: loader,
        preventAssignment: true,
        __Locales__: '[' + getLocaleCodes().join(',') + ']'
      }),
      typescript({
        tsconfig: '../tsconfig.json'
      }),
      commonjs(),
      nodeResolve({
        browser: true,
        preferBuiltins: false
      })
    ],
    treeshake: true,
    output: [
      {
        file: `./dist/${namePrefix}.js`,
        sourcemap: false,
        format: 'iife'
      },
      {
        file: `./dist/${namePrefix}.min.js`,
        format: 'iife',
        sourcemap: false,
        plugins: [terser(terserOptions)]
      },
      {
        file: `../paf-mvp-demo-express/public/assets/${namePrefix}.js`,
        sourcemap: false,
        format: 'iife'
      },
      {
        file: `../paf-mvp-demo-express/public/assets/${namePrefix}.min.js`,
        format: 'iife',
        sourcemap: false,
        plugins: [terser(terserOptions)]
      },
    ]
  }
}

// Returns configuration for a specific locale.
// localeCode the code of the locale being built for. i.e. en-GB
// localeContent the JSON object with the content
// mockAuditLogs the JSON object with mock audit logs included
function buildLocaleConfig(localeCode, localeContent, mockAuditLogs) {
  const baseOutput = {
    sourcemap: false,
    format: 'umd',
    name: globalName
  };
  return {
    input: './src/controller.ts',
    plugins: [
      replace({
        include: './src/controller.ts',
        preventAssignment: true,
        __Locale__: localeContent,
        __MockAuditLogs__: mockAuditLogs
      }),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify(DEV ? 'development' : 'production'),
        // Needed to ensure the client side version with Promise based functions is used.
        'ecdsa-secp256r1': 'ecdsa-secp256r1/browser'
      }),
      postHTML({ template: true }),
      minifyHTML({
        // Include string literals that contain the div or section element as well as the default check.
        options: {
          shouldMinify: (t) => defaultShouldMinify(t) || t.parts.some(p =>
            p.text.includes('<div') ||
            p.text.includes('<section'))
        }
      }),
      string({ include: ['**/*.css'] }),
      nodeResolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      globals(),
      json(),
      nodePolyfills( { crypto: false, fs: false }),
      typescript({
        tsconfig: '../tsconfig.json'
      })
    ],
    treeshake: true,
    output: [
      {
        ...baseOutput,
        file: `./dist/${namePrefix}-${localeCode}.js`,
      },
      {
        ...baseOutput,
        file: `./dist/${namePrefix}-${localeCode}.min.js`,
        plugins: [terser(terserOptions)],
      },
      {
        ...baseOutput,
        file: `../paf-mvp-demo-express/public/assets/${namePrefix}-${localeCode}.js`,
      },
      {
        ...baseOutput,
        file: `../paf-mvp-demo-express/public/assets/${namePrefix}-${localeCode}.min.js`,
        plugins: [terser(terserOptions)],
      },
    ]
  }
}

// Create the template for each locale bundle and the loader if server side selection is not being used.
async function getConfigs(locales) {
  const configs = [];
  const mockAuditLogs = JSON.stringify(getMockAuditLogs());
  configs.push(buildLoader());
  locales.forEach((value, locale) => {
    configs.push(buildLocaleConfig(locale, value, mockAuditLogs));
  });
  return configs;
}

// Finally export the configurations for each of the locales.
export default getLocales().then(getConfigs);