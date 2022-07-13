/**
 * Entry point to OneKey library, built as paf-lib.js (TODO rename js file)
 */
import { Window } from '@frontend/global';
import { setUpImmediateProcessingQueue } from '@frontend/utils/queue';
import { CurrentScript } from '@frontend/utils/current-script';
import { OneKeyLib } from './one-key-lib';

// Get properties from HTML
const pafLibScript = new CurrentScript<{ clientHostname: string; upFrontRedirect?: string }>();
pafLibScript.setScript(document.currentScript);

const triggerRedirectIfNeeded =
  pafLibScript.getData()?.upFrontRedirect !== undefined ? pafLibScript.getData().upFrontRedirect === 'true' : true;
export const oneKeyLib = new OneKeyLib(pafLibScript.getData()?.clientHostname, triggerRedirectIfNeeded);

const queue = (<Window>window).PAF?.queue ?? [];
(<Window>window).PAF = oneKeyLib;
(<Window>window).PAF.queue = queue;

(async () => {
  await oneKeyLib.handleAfterBoomerangRedirect();
  await setUpImmediateProcessingQueue((<Window>window).PAF);
})();
