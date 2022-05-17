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

// Used to get the locales available for each of the bundles.
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

// Used to get the TCF core string from the environment.
import { env } from 'process';

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

// Adds the SVG images to the local. Could be expanded to support other images in the future.
function addImages(locale) {
  const directory = './src/images';
  fs.readdirSync('./src/images').forEach(imageFile => {
    if (path.extname(imageFile) === '.svg') {
      const imageName = imageFile.split('.')[0];
      locale[imageName] = fs.readFileSync(path.join(directory, imageFile), 'utf8')
    }
  });
  return locale;
}

// Converts the list of strings to paragraph tags.
function toHtml(list) { return `<p>${list.join('</p><p>')}</p>`; }

// Converts the source locale into one with HTML properties.
function addHTML(locale) {
  locale.introBodyHTML = toHtml(locale.introBody);
  locale.aboutBodyHTML = toHtml(locale.aboutBody);
  locale.settingsBodyHTML = toHtml(locale.settingsBody);
  delete locale['introBody'];
  delete locale['aboutBody'];
  delete locale['settingsBody'];
  return locale;
}

// Converts the source locale into one with HTML and image properties.
function buildLocale(locale) {
  locale = addHTML(locale);
  locale = addImages(locale);
  return locale;
}

// Checks that the locale is valid and throws an exception if it isn't to prevent build.
function validateLocale(locale) {
  if (locale.customizeLabels.length !== locale.customizeTips.length) {
    throw 'Locale must have the same number of labels and tooltips';
  }
}

// Returns the TCF core template string to embed into the CMP.
function getTCFCoreTemplate() {
  const tcfCoreTemplate = env.TCF_CORE_TEMPLATE;
  if (tcfCoreTemplate) {
    console.info(`Using \'${tcfCoreTemplate}\' as TCF core template`);
    return tcfCoreTemplate;
  }
  throw 'Add --environment TCF_CORE_TEMPLATE:YOUR_TCF_CORE_TEMPLATE to the rollup command line, or set the ' +
    'TCF_CORE_TEMPLATE environment variable. This is needed to generate a TCF core string from the built CMP.';
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
    validateLocale(locale);
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
  return {
    input: './src/loader.ts',
    plugins: [
      replace({
        include: './src/loader.ts',
        preventAssignment: true,
        __Locales__: '[' + getLocaleCodes().join(',') + ']'
      }),
      typescript({
        tsconfig: '../tsconfig.json'
      }),
      commonjs(),
      nodeResolve({
        browser: true
      })
    ],
    treeshake: true,
    output: [
      {
        file: `./dist/ok-ui.js`,
        sourcemap: true,
        format: 'iife'
      },
      {
        file: `./dist/ok-ui.min.js`,
        format: 'iife',
        sourcemap: false,
        plugins: [terser(terserOptions)]
      },
      {
        file: `../paf-mvp-demo-express/public/assets/cmp/ok-ui.js`,
        sourcemap: true,
        format: 'iife'
      },
      {
        file: `../paf-mvp-demo-express/public/assets/cmp/ok-ui.min.js`,
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
// tcfCoreTemplate the template string for the CMP
function buildLocaleConfig(localeCode, localeContent, tcfCoreTemplate) {
  return {
    input: './src/main.ts',
    plugins: [
      replace({
        include: './src/main.ts',
        preventAssignment: true,
        __Locale__: localeContent,
        __TcfCoreTemplate__: tcfCoreTemplate
      }),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify(DEV ? 'development' : 'production')
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
      string({ include: ['**/*.css', '**/*.js'] }),
      typescript({
        tsconfig: '../tsconfig.json'
      }),
      commonjs({
        preferBuiltins: true
      }),
      nodeResolve({
        browser: true,
        preferBuiltins: true
      })
    ],
    treeshake: true,
    output: [
      {
        file: `./dist/ok-ui-${localeCode}.js`,
        sourcemap: true,
        format: 'iife'
      },
      {
        file: `./dist/ok-ui-${localeCode}.min.js`,
        format: 'iife',
        sourcemap: false,
        plugins: [terser(terserOptions)]
      },
      {
        file: `../paf-mvp-demo-express/public/assets/cmp/ok-ui-${localeCode}.js`,
        sourcemap: true,
        format: 'iife'
      },
      {
        file: `../paf-mvp-demo-express/public/assets/cmp/ok-ui-${localeCode}.min.js`,
        format: 'iife',
        sourcemap: false,
        plugins: [terser(terserOptions)]
      },
    ]
  }
}

// Create the template for each locale bundle and the loader if server side selection is not being used.
async function getConfigs(locales) {
  const configs = [];
  const tcfCoreTemplate = getTCFCoreTemplate();
  configs.push(buildLoader());
  locales.forEach((value, locale) => {
    configs.push(buildLocaleConfig(locale, value, tcfCoreTemplate));
  });
  return configs;
}

// Finally export the configurations for each of the locales.
export default getLocales().then(getConfigs);
