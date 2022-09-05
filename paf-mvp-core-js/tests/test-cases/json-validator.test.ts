import { JsonSchemaError, JsonSchemaRepository, JsonValidator, NoJsonError } from '@core/validation/json-validator';
import path from 'path';

const fixtureDirectory = path.join(__dirname, '..', 'fixtures', 'fake-json-schemas');

describe('JsonSchemaRepository', () => {
  test('Build instance with fixture directory', () => {
    expect(() => JsonSchemaRepository.build(fixtureDirectory)).not.toThrowError();
  });

  test('Build instance with bad directory', () => {
    const dir = path.join(__dirname, 'doesnt', 'exist');
    expect(() => JsonSchemaRepository.build(dir)).toThrowError();
  });

  test('Build instance with real json schema directory', () => {
    expect(() => JsonSchemaRepository.default()).not.toThrowError();
  });

  test('Load fixture', async () => {
    const repo: JsonSchemaRepository = JsonSchemaRepository.build(fixtureDirectory);
    const schemas = await repo.all();
    expect(schemas.length).toEqual(3);
  });
});

describe('JsonValidator', () => {
  let repo: JsonSchemaRepository;
  let validator: JsonValidator;

  beforeEach(() => {
    repo = JsonSchemaRepository.build(fixtureDirectory);
    validator = new JsonValidator(repo);
  });

  test('Start', async () => {
    expect(async () => validator.start()).not.toThrowError();
  });

  test('validate undefined string', async () => {
    await validator.start();

    const validation = validator.validate('json-schema-1.json', undefined);

    expect(validation).toEqual({
      isValid: false,
      errors: [new NoJsonError('No JSON value.')],
    });
  });

  test('validate empty string', async () => {
    await validator.start();

    const validation = validator.validate('json-schema-1.json', '');

    expect(validation).toEqual({
      isValid: false,
      errors: [new Error('No JSON value')],
    });
  });

  test('validate bad string', async () => {
    await validator.start();

    const validation = validator.validate('json-schema-1.json', '{ "split_json": ');

    expect(validation).toEqual({
      isValid: false,
      errors: [new SyntaxError('Unexpected end of JSON input')],
    });
  });

  test('validate json with wrong format', async () => {
    const json = { text_sub: 'text' };
    await validator.start();

    const validation = validator.validate('json-schema-1.json', JSON.stringify(json));

    expect(validation).toEqual({
      isValid: false,
      errors: [new JsonSchemaError("must have required property 'text' (in root object).")],
    });
  });

  test('validate nested json with wrong format', async () => {
    const json = { text: 'text', child: { text: 'text' } };
    await validator.start();

    const validation = validator.validate('json-schema-1.json', JSON.stringify(json));

    expect(validation).toEqual({
      isValid: false,
      errors: [new JsonSchemaError("must have required property 'text_sub' (at path: /child).")],
    });
  });

  test('validate json with valid format', async () => {
    const json = { text: 'text', child: { text_sub: 'text' } };
    await validator.start();

    const validation = validator.validate('json-schema-1.json', JSON.stringify(json));

    expect(validation).toEqual({
      isValid: true,
      value: json,
    });
  });
});
