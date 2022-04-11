import * as fs from 'fs';
import * as path from 'path';
import { buildAuditLog } from '@core/model/audit-log';
import { AuditLog, TransmissionRequest, TransmissionResponse } from '../../src/model/generated-model';

const fixturesDirectory = path.join('tests', 'fixtures', 'audit-log');

interface Fixture {
  request: TransmissionRequest;
  response: TransmissionResponse;
  auditLog: AuditLog;
}

const loadJson = (...filePath: string[]): any => {
  const joinedPath = path.join(fixturesDirectory, ...filePath);
  const jsonString = fs.readFileSync(joinedPath, 'utf8');
  const json = JSON.parse(jsonString);
  return json;
};

const loadFixture = (directory: string, auditLogName = 'audit-log.json'): Fixture => {
  const auditLog = loadJson(directory, auditLogName);
  const request = loadJson(directory, 'transmission-request.json');
  const response = loadJson(directory, 'transmission-response.json');
  return {
    request,
    response,
    auditLog,
  };
};

describe('Audit Log Tests', () => {
  const defaultDirectory = '1_audit-log_one_transmission';
  const defaultContentId = '90141190-26fe-497c-acee-4d2b649c2112';

  test('Request with unknown version', () => {
    const fixture = loadFixture(defaultDirectory);
    fixture.request.version = '42';

    const auditLog = buildAuditLog(fixture.request, fixture.response, defaultContentId);

    expect(auditLog).toBeUndefined();
  });

  test('Response with unknown version', () => {
    const fixture = loadFixture(defaultDirectory);
    fixture.response.version = '42';

    const auditLog = buildAuditLog(fixture.request, fixture.response, defaultContentId);

    expect(auditLog).toBeUndefined();
  });

  test('Not found', () => {
    const fixture = loadFixture(defaultDirectory);

    const auditLog = buildAuditLog(fixture.request, fixture.response, 'bad-content-id');

    expect(auditLog).toBeUndefined();
  });

  test('one transmission for one content id', () => {
    const fixture = loadFixture(defaultDirectory);

    const auditLog = buildAuditLog(fixture.request, fixture.response, defaultContentId);

    expect(auditLog).toEqual(fixture.auditLog);
  });

  test('2 nested transmissions for one content id', () => {
    const fixture = loadFixture('2_audit-log_two_transmissions');

    const auditLog = buildAuditLog(fixture.request, fixture.response, defaultContentId);

    expect(auditLog).toEqual(fixture.auditLog);
  });

  test('2 nested transmissions with many content_id', () => {
    const fixture = loadFixture(
      '3_audit-log_many_children_and_content_id',
      'audit-log-90141190-26fe-497c-acee-4d2b649c2112.json'
    );

    const auditLog = buildAuditLog(fixture.request, fixture.response, defaultContentId);

    expect(auditLog).toEqual(fixture.auditLog);
  });

  test('3 nested transmissions with many pathes', () => {
    const fixture = loadFixture(
      '3_audit-log_many_children_and_content_id',
      'audit-log-8dc32df6-f379-4dbb-bf82-a495d9ec898a.json'
    );

    const auditLog = buildAuditLog(fixture.request, fixture.response, '8dc32df6-f379-4dbb-bf82-a495d9ec898a');

    expect(auditLog).toEqual(fixture.auditLog);
  });
});
