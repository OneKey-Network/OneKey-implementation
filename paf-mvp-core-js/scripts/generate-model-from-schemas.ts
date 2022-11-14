import { compile } from 'json-schema-to-typescript';
import { JSONSchema4 } from 'json-schema';
import * as path from 'path';
import * as fs from 'fs';
import { ResolverOptions } from '@apidevtools/json-schema-ref-parser';

const inputDir = path.join(__dirname, '..', '..', 'addressability-framework', 'mvp-spec', 'json-schemas');

if (!fs.existsSync(inputDir)) {
  throw `Input dir not found: "${inputDir}"`;
}

const outputFile = path.join(__dirname, '..', 'src', 'model', 'generated-model.ts');

/**
 * Remove "overriding" properties when referencing an external schema
 * This is to avoid the generator to consider it is a specific interface.
 * Removes:
 *  - description
 *  - examples
 *  - enum
 * @param schema
 */
const removeAdditionalWhenRef = (schema: JSONSchema4): JSONSchema4 => {
  if (schema.$ref) {
    schema.description = undefined;
    schema.examples = undefined;
    schema.enum = undefined;
  }
  if (schema.properties !== undefined) {
    Object.keys(schema.properties).forEach((currentKey) => {
      schema.properties[currentKey] = removeAdditionalWhenRef(schema.properties[currentKey]);
    });
  } else if (schema.items) {
    schema.items = removeAdditionalWhenRef(schema.items);
  }

  return schema;
};

const cleanSchema = (schema: JSONSchema4): JSONSchema4 => {
  // Remove the title attribute that is used to generate interface names (makes very long and ugly names)
  const { title, description, ...rest } = removeAdditionalWhenRef(schema);

  // Remove all descriptions from references otherwise the generator will create a new interface (duplicate!)
  return {
    ...rest,
    // If no description was provided, use the title instead (useful for comments)
    description: description ?? title,
    // Automatically add an "id" field that seems to be needed to get a consistent data model
    id: schema.$id,
  };
};

(async () => {
  // Construct a "fake" object that references ALL schemas in the directory,
  // to make sure we generate all types in one output file
  // (json-schema-to-typescript doesn't support to take a _list_ of schemas)
  const files = await fs.promises.readdir(inputDir);

  const schemas = await Promise.all(
    files.map(async (f) => JSON.parse(await fs.promises.readFile(path.join(inputDir, f), 'utf-8')))
  );
  const initialValue: JSONSchema4 = {
    id: 'root',
    title: '_',
    type: 'object',
    properties: {},
    additionalProperties: false,
    description: '** Please ignore **\nOnly needed to have an entry point for generating all interfaces together',
  };

  const rootSchema = schemas.reduce((accumulator: JSONSchema4, current: JSONSchema4) => {
    accumulator.properties[current.$id] = { $ref: `${current.$id}.json` };
    return accumulator;
  }, initialValue);

  const schemaStore = schemas.reduce((accumulator: JSONSchema4, current: JSONSchema4) => {
    accumulator[`${current.$id}.json`] = cleanSchema(current);
    return accumulator;
  }, {});

  // Define a custom resolver that will look "*.json" files in the same repo
  // This is required to be able to use id properties without ".json" at the end
  const resolver: ResolverOptions = {
    order: 1, // Will be executed first
    canRead: true,
    read(file) {
      const fileName = path.basename(file.url);
      const schema = schemaStore[fileName];
      if (!schema) {
        console.error(`Unable to locate referenced file ${fileName}`);
      }
      return JSON.stringify(schema);
    },
  };

  const ts = `/* eslint-disable */\n${await compile(rootSchema, rootSchema.id, {
    $refOptions: {
      resolve: { localFile: resolver },
    },
    strictIndexSignatures: true,
  })}`;

  await fs.promises.writeFile(outputFile, ts);

  console.log(`Updated: ${outputFile}`);
})();
