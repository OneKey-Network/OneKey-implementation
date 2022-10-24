//see https://k6.io/docs/using-k6/k6-options/reference/
export function getOptions() {
    return {
        noConnectionReuse: false,
        noCookiesReset: false,
        stages:[
            { duration: '5m', target: 50 },
            /*{ duration: '5m', target: 100 },
            { duration: '5m', target: 200 },
            { duration: '5m', target: 300 },
            { duration: '5m', target: 400 },
            { duration: '5m', target: 500 },
            { duration: '5m', target: 600 },
            { duration: '5m', target: 700 },
            { duration: '5m', target: 800 },
            { duration: '5m', target: 900 },
            { duration: '5m', target: 1000 },
            { duration: '5m', target: 1100 },
            { duration: '5m', target: 1200 },
            { duration: '5m', target: 1300 },
            { duration: '5m', target: 1400 },
            { duration: '5m', target: 1500 },
            { duration: '5m', target: 1600 },
            { duration: '5m', target: 1700 },
            { duration: '5m', target: 1800 },
            { duration: '60m', target: 2000 },
            { duration: '100m', target: 0 },*/
            /*{ duration: '5m', target: 2100 },
            { duration: '5m', target: 2200 },
            { duration: '5m', target: 2300 },
            { duration: '5m', target: 2400 },
            { duration: '5m', target: 2500 },
            { duration: '5m', target: 2600 },
            { duration: '5m', target: 2700 },
            { duration: '5m', target: 2800 },
            { duration: '5m', target: 2900 },
            { duration: '5m', target: 3000 },*/
        ]
    };
}

export function getCMPHost() {
    return "https://cmp.pafdemopublisher.com";
}

export function getBaseHost() {
    return "https://www.pafdemopublisher.com/";
}

export function getSleepDuration() {
    return 0.001;
}