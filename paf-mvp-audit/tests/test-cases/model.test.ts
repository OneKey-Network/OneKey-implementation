import { AutomobileExample, AuditLogMock } from '../helpers/audit-log-mock';
import { IdentityResolverMap } from '../../src/identity-resolver';
import { Model, OverallStatus, VerifiedStatus } from '../../src/model';
import { AuditLog } from '@core/model';
import { Log } from '@core/log';
import * as fs from 'fs';
import path from 'path';

describe('testing model', () => {
  let mock: AuditLogMock;
  let auditLog: AuditLog;
  let resolver: IdentityResolverMap;
  const log = new Log('audit model test');

  beforeEach(() => {
    // Create a mock audit log ensuring that the
    mock = new AuditLogMock(log);
    auditLog = mock.BuildAuditLog(AutomobileExample, { use_browsing_for_personalization: true });

    // Check that the audit log appears valid.
    expect(auditLog).toBeDefined();
    expect(auditLog.seed.publisher).toBe(AutomobileExample.host);
    expect(auditLog.data.preferences.data.use_browsing_for_personalization).toBe(true);

    // Check that the resolver from the mock works for the root.
    resolver = mock.GetIdentityResolverMap();
    resolver.get(AutomobileExample.host).then((i) => expect(i.name).toBe(AutomobileExample.name));
  });

  test('check identity resolution works for all nodes', async () => {
    const model = await new Model(log, resolver, auditLog).verify();

    // Check the properties for all verified fields are as expected.
    model.allVerifiedFields.forEach((i) => expect(i.value.verifiedStatus).toBe(VerifiedStatus.Valid));
    model.allVerifiedFields.forEach((i) => expect(i.value.valid).toBe(true));
    model.allVerifiedFields.forEach((i) => expect(i.value.identity).toBeDefined());

    // Check that the overall status is good.
    expect(model.overall.value).toBe(OverallStatus.Good);

    saveAuditLog('all-good.json', auditLog, resolver);
  });

  test("check identity resolution fails when one identity can't be found", async () => {
    // Remove the 'minivan.example' domain from the list of domains that can be resolved.
    const toRemove = auditLog.transmissions.find((i) => i.source.domain === 'minivan.example');
    expect(toRemove).toBeDefined();
    resolver.map.delete(toRemove.source.domain);

    // Create the model.
    const model = await new Model(log, resolver, auditLog).verify();

    // Check the seed and ids and preferences fields are valid.
    expect(model.seed.value.verifiedStatus).toBe(VerifiedStatus.Valid);
    expect(model.idsAndPreferences.value.verifiedStatus).toBe(VerifiedStatus.Valid);

    // Find the result for the missing domain.
    const failed = model.results.find((i) => i.value.value.source.domain === toRemove.source.domain);
    expect(failed).toBeDefined();

    // Get the verified result and check it's identity not found.
    expect(failed.value.verifiedStatus).toBe(VerifiedStatus.IdentityNotFound);

    // Check the statuses for all the other results are valid.
    model.results.forEach((result) => {
      if (result.value.value.source.domain !== toRemove.source.domain) {
        expect(result.value.verifiedStatus).toBe(VerifiedStatus.Valid);
      }
    });

    // Check the count of identity not found status is one.
    expect(model.count(VerifiedStatus.IdentityNotFound)).toBe(1);

    // Check that the overall status is caution as the identity can't be found.
    expect(model.overall.value).toBe(OverallStatus.Suspicious);

    saveAuditLog('identity-not-found.json', auditLog, resolver);
  });

  test('check verification fails when one signature is corrupted', async () => {
    // Corrupt the 'minivan.example' domain from the list of domains that can be resolved.
    const toCorrupt = auditLog.transmissions.find((i) => i.source.domain === 'minivan.example');
    toCorrupt.source.signature = '0' + toCorrupt.source.signature;

    // Create the model.
    const model = await new Model(log, resolver, auditLog).verify();

    // Check the seed and ids and preferences fields are valid.
    expect(model.seed.value.verifiedStatus).toBe(VerifiedStatus.Valid);
    expect(model.idsAndPreferences.value.verifiedStatus).toBe(VerifiedStatus.Valid);

    // Find the result for the missing domain.
    const failed = model.results.find((i) => i.value.value.source.domain === toCorrupt.source.domain);
    expect(failed).toBeDefined();

    // Get the verified result and check it's identity not found.
    expect(failed.value.verifiedStatus).toBe(VerifiedStatus.NotValid);

    // Check the statuses for all the other results are valid.
    model.results.forEach((result) => {
      if (result.value.value.source.domain !== toCorrupt.source.domain) {
        expect(result.value.verifiedStatus).toBe(VerifiedStatus.Valid);
      }
    });

    // Check the count of not valid status is one.
    expect(model.count(VerifiedStatus.NotValid)).toBe(1);

    // Check that the overall status is bad as the signature is invalid.
    expect(model.overall.value).toBe(OverallStatus.Violation);

    saveAuditLog('corrupt-signature.json', auditLog, resolver);
  });

  test('check verification when response is not success for one result', async () => {
    // Corrupt the 'minivan.example' in the list of results.
    const toCorrupt = auditLog.transmissions.find((i) => i.source.domain === 'minivan.example');
    toCorrupt.status = 'error_cannot_process';

    // Create the model.
    const model = await new Model(log, resolver, auditLog).verify();

    // Check that the overall status is bad as the signature is invalid.
    expect(await model.overall.value).toBe(OverallStatus.Suspicious);

    saveAuditLog('result-error.json', auditLog, resolver);
  });
});

/**
 * Saves the audit log and resolver in the name provided if there is a global variable 'mock-audit-log-path'.
 * @param fileName
 * @param auditLog
 * @param resolver
 */
function saveAuditLog(fileName: string, auditLog: AuditLog, resolver: IdentityResolverMap) {
  const mockAuditLogPath = globalThis['mock-audit-log-path'];
  if (mockAuditLogPath) {
    const fullPath = path.join(mockAuditLogPath, fileName);
    fs.writeFileSync(
      fullPath,
      JSON.stringify({
        auditLog: auditLog,
        resolver: Array.from(resolver.map.entries()),
      })
    );
  }
}
