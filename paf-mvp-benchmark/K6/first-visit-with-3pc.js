import {getOptions, getCMPHost, getBaseHost, getSleepDuration } from './config.js';
import { signedPrefsMock, unsignedPrefsMock } from './data.js';
import { call, processCookies, simplePost } from './util.js';
import { sleep, check, group, fail } from 'k6';
export let options = getOptions();
const CMP_HOST = getCMPHost();
const BASE_URL = getBaseHost();
const SLEEP_DURATION = getSleepDuration();

const firstVisitWith3PC = () => {    
    group('firstVisitWith3PC:InitialCheck', (_) => {
        let context = {};
        //Get target url
        let currentIdsPrefs = call(`${CMP_HOST}/paf-proxy/v1/ids-prefs`, { headers: { 'Origin': BASE_URL } });
        processCookies(currentIdsPrefs, context);
        //Check 3pc
        let _3pc = call(`${CMP_HOST}/paf-proxy/v1/3pc`, { headers: { 'Origin': BASE_URL }, cookies: context });
        if(!check(_3pc, {
            'success': (r) => {
                if(!(r.status === 200)) return false;
                let content = JSON.parse(_3pc.body);
                return (content.hasOwnProperty("3pc"));
            }
        })){
            fail("3pc test failed");
        }
    });
    group('firstVisitWith3PC:SignAndWrite', (_) => {
        //Sign Prefs
        let signedPrefs = simplePost(`${CMP_HOST}/paf-proxy/v1/sign/prefs`, { headers: { 'Origin': BASE_URL }}, unsignedPrefsMock);
        if(!check(signedPrefs, {
            'success': (r) => r.status === 200
        })){
            fail("call /paf-proxy/v1/sign/prefs failed");
            return;
        }
        //Write ids and prefs: Get target url
        let redirectIdsPrefs = simplePost(`${CMP_HOST}/paf-proxy/v1/ids-prefs`, { headers: { 'Origin': BASE_URL }}, signedPrefsMock);
        if(!check(redirectIdsPrefs, {
            'success': (r) => r.status === 200
        })){
            fail("call /paf-proxy/v1/ids-prefs failed");
            return;
        }
        let redirectIdsPrefsContent = JSON.parse(redirectIdsPrefs.body);
        let contentToWrite = redirectIdsPrefsContent.payload;
        let targetUrl = redirectIdsPrefsContent.url;
        //Write ids and prefs: Write
        let writeIdsPrefs = simplePost(targetUrl, { headers: { 'Origin': BASE_URL }}, contentToWrite);
        if(!check(writeIdsPrefs, {
            'success': (r) => r.status === 200
        })){
            fail("Write failed");
        }
    });
}

export function setup() {
}

export default () => {
    firstVisitWith3PC();
    sleep(SLEEP_DURATION);
}

export function teardown(data) {
}
