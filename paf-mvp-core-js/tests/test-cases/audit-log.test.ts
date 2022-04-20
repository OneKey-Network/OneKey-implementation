import { buildAuditLog, fromResponseToResult } from '@core/model/audit-log';
import { TransmissionResponse } from '@core/model/generated-model';
import {
  buildAuditLogFixture,
  buildTransmissionResponseFixture,
  contentFixture,
  seedFixture,
  dataFixture,
  retrieveTransmissionResults,
  generateContents,
} from '../fixtures/audit-log-fixtures';

describe('Audit Log Tests', () => {
  let dspResponse: TransmissionResponse;

  beforeEach(() => {
    dspResponse = buildTransmissionResponseFixture('dsp1', [contentFixture]);
  });

  test('Response with unknown version', () => {
    dspResponse.version = '42';

    const auditLog = buildAuditLog(seedFixture, dataFixture, dspResponse, contentFixture.content_id);

    expect(auditLog).toBeUndefined();
  });

  test('Not found', () => {
    const auditLog = buildAuditLog(seedFixture, dataFixture, dspResponse, 'bad-content-id');

    expect(auditLog).toBeUndefined();
  });

  test('one transmission for one content id', () => {
    const expected = buildAuditLogFixture([fromResponseToResult(dspResponse)]);

    const auditLog = buildAuditLog(seedFixture, dataFixture, dspResponse, contentFixture.content_id);

    expect(auditLog).toEqual(expected);
  });

  test('2 nested transmissions for one content id', () => {
    const response = buildTransmissionResponseFixture('ssp1', [], [dspResponse]);
    const results = retrieveTransmissionResults('ssp1#dsp1', response);
    const expected = buildAuditLogFixture(results);

    const auditLog = buildAuditLog(seedFixture, dataFixture, response, contentFixture.content_id);

    expect(auditLog).toEqual(expected);
  });

  test('3 nested transmissions with many content_id', () => {
    const contentIds = generateContents(2, 'dsp1');
    contentIds.push(contentFixture);

    const response = buildTransmissionResponseFixture(
      'ssp1',
      [],
      [
        buildTransmissionResponseFixture(
          'ssp2',
          [],
          [buildTransmissionResponseFixture('dsp1', contentIds, [buildTransmissionResponseFixture('partner', [], [])])]
        ),
      ]
    );
    const results = retrieveTransmissionResults('ssp1#ssp2#dsp1', response);

    const expected = buildAuditLogFixture(results);
    const auditLog = buildAuditLog(seedFixture, dataFixture, response, contentFixture.content_id);

    expect(auditLog).toEqual(expected);
  });

  test('Multiple paths', () => {
    const response = buildTransmissionResponseFixture(
      'ssp1',
      [],
      [
        buildTransmissionResponseFixture(
          'ssp2',
          [],
          [buildTransmissionResponseFixture('dsp1', generateContents(2, 'dsp1'), [])]
        ),
        buildTransmissionResponseFixture(
          'ssp3',
          [],
          [
            buildTransmissionResponseFixture('dsp2', generateContents(2, 'dsp2'), []),
            buildTransmissionResponseFixture('dsp3', [], []),
          ]
        ),
        buildTransmissionResponseFixture('ssp4', [], [buildTransmissionResponseFixture('dsp3', [contentFixture], [])]),
      ]
    );
    const results = retrieveTransmissionResults('ssp1#ssp4#dsp3', response);

    const expected = buildAuditLogFixture(results);
    const auditLog = buildAuditLog(seedFixture, dataFixture, response, contentFixture.content_id);

    expect(auditLog).toEqual(expected);
  });
});
