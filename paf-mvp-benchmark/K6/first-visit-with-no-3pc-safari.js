import {getOptions, getCMPHost, getBaseHost, getSleepDuration } from './config.js';
import {processCookies, call, simplePost } from './util.js';
import { sleep, check, fail, group } from 'k6';
export let options = getOptions();
const CMP_HOST = getCMPHost();
const BASE_URL = getBaseHost();
const SLEEP_DURATION = getSleepDuration();
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2';

const firstVisitWithNo3PCSafari = () => {
    group('firstVisitWithNo3PC:InitialCheck', (_) => {
        let context = {};
        //Get target url
        let currentIdsPrefs = call(`${CMP_HOST}/paf-proxy/v1/redirect/ids-prefs`, { headers: { 'Origin': BASE_URL, 'User-Agent':USER_AGENT } });
        processCookies(currentIdsPrefs, context);
        //Check 3pc
        let _3pc = call(`${CMP_HOST}/paf-proxy/v1/3pc`, { headers: { 'Origin': BASE_URL, 'User-Agent':USER_AGENT  } });
        if(!check(_3pc, {
            'success': (r) => {
                if(!(r.status === 200)) return false;
                let content = JSON.parse(r.body);
                return content.hasOwnProperty("type") && content.type === "3PC_NOT_SUPPORTED";
            }
        })){
            fail("3pc test failed");
        }
    });
    group('firtVisitWithNo3PC:Redirect', (_) => {
        let currentIdsPrefs = call(`${CMP_HOST}/paf-proxy/paf/v1/redirect/get-ids-prefs?returnUrl=https:%2F%2Fwww.pafdemopublisher.com%2F%3Fpaf_show_prompt%3DpromptIfUnknownUser`, { headers: {'Origin': BASE_URL, 'Referer':  CMP_HOST } });
        let operatorTargetUrl = currentIdsPrefs.url;
        let rawPayload = operatorTargetUrl.slice(operatorTargetUrl.indexOf("&paf=")+5);
        let data = decodeURIComponent(rawPayload);
        let afterRead = simplePost(`${CMP_HOST}/paf-proxy/v1/verify/read`, { headers: {'Origin': BASE_URL, 'User-Agent':USER_AGENT }}, data);
        if(!check(afterRead, {
            'success': (r) => {
                if(!(r.status === 200)) return false;
                let content = JSON.parse(r.body);
                return content.hasOwnProperty("body") && content.body.hasOwnProperty("identifiers");
            }
        })){
            fail("Redirect test failed");
        }
    });
}

export function setup() {
}

export default () => {
    firstVisitWithNo3PCSafari();
    sleep(SLEEP_DURATION);
}

export function teardown(data) {
}
