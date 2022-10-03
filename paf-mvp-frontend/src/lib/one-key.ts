/**
 * Entry point to OneKey library, built as onekey.js (TODO rename js file)
 */
import { Window } from '@onekey/frontend/global';
import { setUpImmediateProcessingQueue } from '@onekey/frontend/utils/queue';
import { OneKeyLib } from '@onekey/frontend/lib/paf-lib';
import { CurrentScript } from '@onekey/frontend/utils/current-script';
import { auditLogStorageService } from '@onekey/frontend/services/audit-log-storage.service';
import { seedStorageService } from '@onekey/frontend/services/seed-storage.service';
import { Log, LogLevel } from '@onekey/core/log';
import { HttpService } from '@onekey/frontend/services/http.service';

// Debug level while playing with MVP
Log.level = LogLevel.Debug;

// Get properties from HTML
const pafLibScript = new CurrentScript<{ clientHostname: string; upFrontRedirect?: string; cookieTtl?: string }>();
pafLibScript.setScript(document.currentScript);

const triggerRedirectIfNeeded =
  pafLibScript.getData()?.upFrontRedirect !== undefined ? pafLibScript.getData().upFrontRedirect === 'true' : true;
export const oneKeyLib = new OneKeyLib(
  pafLibScript.getData()?.clientHostname,
  triggerRedirectIfNeeded,
  auditLogStorageService,
  seedStorageService,
  new HttpService(),
  pafLibScript.getData()?.cookieTtl
);

const queue = (<Window>window).OneKey?.queue ?? [];
(<Window>window).OneKey = oneKeyLib;
(<Window>window).OneKey.queue = queue;

(async () => {
  await oneKeyLib.handleAfterBoomerangRedirect();
  await setUpImmediateProcessingQueue((<Window>window).OneKey);
})();
