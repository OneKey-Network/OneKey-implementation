import { Log } from '@core/log';
import { default as AjvClass, ErrorObject } from 'ajv';
import fs from 'fs';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Json = any;

export enum JsonSchemaType {
  createSeedRequest = 'post-seed-request.json',
  writeIdAndPreferencesRestRequest = 'post-ids-prefs-request.json',
  writeIdAndPreferencesRedirectRequest = 'redirect-post-ids-prefs-request.json',
  readIdAndPreferencesRestRequest = 'get-ids-prefs-request.json',
  readIdAndPreferencesRedirectRequest = 'redirect-get-ids-prefs-request.json',
  deleteIdAndPreferencesRequest = 'delete-ids-prefs-request.json',
  deleteIdAndPreferencesRedirectRequest = 'redirect-delete-ids-prefs-request.json',
  getNewIdRequest = 'get-new-id-request.json',
}

/**
 * Validatation structure for a JSON
 * against a JSON schema.
 *
 * If isValid = true,  the 'value' is available,
 * else the instance contains 'errors'.
 */
export interface JsonValidation {
  isValid: boolean;
  value?: Json;
  errors?: Error[];
}

/**
 * Validate jsons against JSON schemas.
 */
export interface IJsonValidator {
  /**
   * Load all the required resources for futher validation.
   * Throw an error if the resource load fails.
   *
   * To be called at server start up.
   */
  start(): Promise<void>;

  /**
   * Validate a json string against a JSON schema.
   * @param schema The JSON schema id (Ref: JsonSchemaTypes)
   * @param jsonStr The string to validate.
   * @throw JsonSchemaError, SyntaxError, NoJsonError
   */
  validate(schema: JsonSchemaType, jsonStr: string): JsonValidation;
}

/**cd
 * Load JSON Schemas resources.
 */
export interface IJsonSchemaRepository {
  /**
   * Load all JSON schemas available.
   */
  all(): Promise<Json[]>;
}

/**
 * Error when a JSON is invalidated against
 * a JSON schema.
 */
export class JsonSchemaError extends Error {}

/**
 * Error when a JSON is empty.
 */
export class NoJsonError extends Error {}

export class JsonValidator implements IJsonValidator {
  private schemaRepository: IJsonSchemaRepository;
  private ajv?: AjvClass;

  public static default() {
    return new JsonValidator(JsonSchemaRepository.default());
  }

  constructor(schemaRepository: IJsonSchemaRepository) {
    this.schemaRepository = schemaRepository;
  }

  validate(schemaType: JsonSchemaType, jsonStr: string): JsonValidation {
    if (this.ajv === undefined) {
      throw 'JsonValidator has to be started first';
    }

    if (jsonStr === undefined || jsonStr === '') {
      return {
        isValid: false,
        errors: [new NoJsonError('No JSON value')],
      };
    }

    try {
      const json = JSON.parse(jsonStr);
      const ajvValidate = this.ajv.getSchema(schemaType);
      const isValid = ajvValidate(json);

      if (isValid) {
        return {
          isValid: true,
          value: json,
        };
      } else {
        const errors = ajvValidate.errors.map(this.buildError);
        return {
          isValid: false,
          errors: errors,
        };
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [error],
      };
    }
  }

  async start() {
    const schemas = await this.schemaRepository.all();
    this.ajv = new AjvClass({ strict: false, schemas });
  }

  private buildError(err: ErrorObject): Error {
    const pathStr = err.instancePath === '' ? 'in root object' : `at path: ${err.instancePath}`;
    const msg = `${err.message} (${pathStr}).`;
    return new JsonSchemaError(msg);
  }
}

export class JsonSchemaRepository implements IJsonSchemaRepository {
  private logger: Log;
  private schemasDirectory: string;

  public static default(): JsonSchemaRepository {
    const dir = path.join(__dirname, '..', '..', '..', 'addressability-framework', 'mvp-spec', 'json-schemas');
    return this.build(dir);
  }

  public static build(directory: string): JsonSchemaRepository {
    if (!fs.existsSync(directory)) {
      throw new Error(`File doesn't exist. Cannot load: ${directory}`);
    }
    return new JsonSchemaRepository(directory);
  }

  async all(): Promise<Json[]> {
    const fileNames: string[] = await this.listFiles(this.schemasDirectory);
    const contentPromises: Promise<string>[] = fileNames.map((f) => this.loadFile(f));
    const contents: string[] = await Promise.all(contentPromises);
    const jsons: Json[] = this.createJsons(contents);
    this.cleanUp(jsons);
    return jsons;
  }

  private constructor(directory: string) {
    this.logger = new Log('JsonSchemaRepository', '#bbb');
    this.schemasDirectory = directory;
  }

  private async listFiles(dir: string): Promise<string[]> {
    const files = await fs.promises.readdir(dir);
    const filtered = files.filter((f: string) => f.endsWith('.json'));
    return filtered;
  }

  private async loadFile(file: string): Promise<string> {
    const fullPath = path.join(this.schemasDirectory, file);
    const data = await fs.promises.readFile(fullPath);
    const content = data.toString();
    return content;
  }

  private createJsons(jsonStrs: string[]): Json[] {
    const jsons = new Array<Json>();
    for (const content of jsonStrs) {
      try {
        const json = JSON.parse(content);
        jsons.push(json);
      } catch (e) {
        this.logger.Error(e);
      }
    }
    return jsons;
  }

  /**
   * Patch to make it works with AJV the existing schema
   * used for class generation in the demo project.
   */
  private cleanUp(schemas: Json) {
    for (const schema of schemas) {
      if (schema['$id'] !== undefined && !schema['$id'].endsWith('.json')) {
        schema['$id'] = `${schema['$id']}.json`;
      }
      delete schema['$schema'];
      if (schema['format'] === 'hostname' || schema['format'] === 'GUID') {
        delete schema['format'];
      }
    }
  }
}
