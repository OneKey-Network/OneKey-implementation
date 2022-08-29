import { AuditHandler, OneKeyLib, SeedEntry } from '@frontend/lib/paf-lib';
import { TransactionId, TransmissionResponse } from '@core/model';
import { IAuditLogStorageService } from '@frontend/services/audit-log-storage.service';
import { ISeedStorageService } from '@frontend/services/seed-storage.service';
import { buildAuditLog } from '@core/model/audit-log';

const auditLogStorageService: IAuditLogStorageService = {
  saveAuditLog: jest.fn(),
  getAuditLogByDivId: jest.fn(),
};
const seedEntry: SeedEntry = {
  seed: undefined,
  idsAndPreferences: undefined,
};
const seedStorageService: ISeedStorageService = {
  saveSeed: jest.fn(),
  getSeed: jest.fn((transactionId: TransactionId) => seedEntry),
};
const pafClientNodeHost = 'http://localhost';
let lib: OneKeyLib;
let notificationHandler: jest.Mock<Promise<void>, []>;
let auditLogHandler: jest.Mock<any, [HTMLElement]>;

const resetLib = () => {
  lib = new OneKeyLib(pafClientNodeHost, true, auditLogStorageService, seedStorageService);
  notificationHandler = jest.fn(() => Promise.resolve());
  auditLogHandler = jest.fn((element: HTMLElement) => Promise.resolve());
  lib.setNotificationHandler(notificationHandler);
  lib.setAuditLogHandler(auditLogHandler);
};
describe('Function registerTransmissionResponse', () => {
  const seedStorageServiceSpy = jest.spyOn(seedStorageService, 'getSeed');
  const audiLogStorageServiceSpy = jest.spyOn(auditLogStorageService, 'saveAuditLog');
  document.body.innerHTML = '<div id="div1"/>';
  const auditHandler: AuditHandler = {
    bind: jest.fn((element: HTMLElement) => {
      return;
    }),
  };
  const divId = 'div1';
  const contentId = 'content_id_2';
  const transmissionResponse: TransmissionResponse = {
    version: '0.1',
    contents: [
      {
        transaction_id: 'transaction_id_1',
        content_id: 'content_id_1',
      },
    ],
    status: 'success',
    details: '',
    receiver: 'exemple.com',
    source: {
      domain: 'exemple.com',
      timestamp: 1639589531,
      signature: 'd01c6e83f14b4f057c2a2a86d320e2454fc0c60df4645518d993b5f40019d24c',
    },
    children: [
      {
        version: '0.1',
        contents: [
          {
            transaction_id: 'transaction_id_2',
            content_id: 'content_id_2',
          },
        ],
        status: 'success',
        details: '',
        receiver: 'exemple2.com',
        source: {
          domain: 'exemple2.com',
          timestamp: 1639589531,
          signature: 'd01c6e83f14b4f057c2a2a86d320e2454fc0c60df4645518d993b5f40019d24c',
        },
        children: [],
      },
    ],
  };
  beforeEach(() => {
    resetLib();
  });
  test('should call seedStorageService with the right transactionId', () => {
    lib.registerTransmissionResponse({ divIdOrAdUnitCode: divId, contentId, auditHandler }, transmissionResponse);
    expect(seedStorageServiceSpy).toBeCalledWith('transaction_id_2');
  });
  test('should return the generated audit log', () => {
    const returnedAuditLog = lib.registerTransmissionResponse(
      { divIdOrAdUnitCode: divId, contentId, auditHandler },
      transmissionResponse
    );
    const expectedAuditLog = buildAuditLog(
      seedEntry.seed,
      seedEntry.idsAndPreferences,
      transmissionResponse,
      contentId
    );
    expect(returnedAuditLog).toEqual(expectedAuditLog);
  });
  test('should call auditLogStorageService to save the audit log  with the right parameters', () => {
    lib.registerTransmissionResponse({ divIdOrAdUnitCode: divId, contentId, auditHandler }, transmissionResponse);
    const expectedAuditLog = buildAuditLog(
      seedEntry.seed,
      seedEntry.idsAndPreferences,
      transmissionResponse,
      contentId
    );
    expect(audiLogStorageServiceSpy).toBeCalledWith(divId, expectedAuditLog);
  });
  test('should fire an event when audit log is saved', () => {
    lib.registerTransmissionResponse({ divIdOrAdUnitCode: divId, contentId, auditHandler }, transmissionResponse);
    expect(auditLogHandler).toBeCalledWith(document.getElementById(divId));
  });
});
