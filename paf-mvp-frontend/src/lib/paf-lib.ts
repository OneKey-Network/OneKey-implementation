import { setUpImmediateProcessingQueue } from '../utils/queue';
import { Window } from '../global';
import { CurrentScript } from '@frontend/utils/current-script';
import { OneKeyLib } from '@frontend/lib/one-key-lib';

// Get properties from HTML
const pafLibScript = new CurrentScript<{ clientHostname: string; upFrontRedirect?: string }>();
pafLibScript.setScript(document.currentScript);

const triggerRedirectIfNeeded =
  pafLibScript.getData()?.upFrontRedirect !== undefined ? pafLibScript.getData().upFrontRedirect === 'true' : true;

export const oneKeyLib = new OneKeyLib(pafLibScript.getData()?.clientHostname, triggerRedirectIfNeeded);

const queue = (<Window>window).PAF?.queue;
(<Window>window).PAF = oneKeyLib;
(<Window>window).PAF.queue = queue;

(async () => {
  await oneKeyLib.handleAfterBoomerangRedirect();
  await setUpImmediateProcessingQueue((<Window>window).PAF);
})();
