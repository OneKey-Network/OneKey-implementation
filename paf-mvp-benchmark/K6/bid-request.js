import {getOptions, getCMPHost, getBaseHost, getSleepDuration } from './config.js';
import {simplePost } from './util.js';
import { signedPrefsMock} from './data.js';
import { sleep } from 'k6';
export let options = getOptions();
const CMP_HOST = getCMPHost();
const BASE_URL = getBaseHost();
const SLEEP_DURATION = getSleepDuration();

const createSeed = () => {
    let seedRequest = {
        data: signedPrefsMock,
        transaction_ids:["a","b","c"]
    };
    let seed = simplePost(`${CMP_HOST}/paf-proxy/v1/seed`, { headers: { 'Origin': BASE_URL } }, seedRequest);
    if(!check(seed, {
        'success': (r) => r !== null
    })){
        fail("Seed request failed");
    }
}

export function setup() {
}

export default () => {
    createSeed();
    sleep(SLEEP_DURATION);
}

export function teardown(data) {
}