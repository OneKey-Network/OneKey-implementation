# OneKey Capacity Planning

## Toolkit
K6 load testing tools:
- [K6 Official Documentation](https://k6.io/docs/)
- [A useful summary](https://pflb.us/blog/k6-user-manual/)

## Prometheus
In order to use K6 to Prometheus exporter: 
- Build K6 with Prometheus extension: [K6 Prometheus](https://k6.io/docs/results-output/real-time/prometheus/)
- Set the environment variable: K6_PROMETHEUS_REMOTE_URL to Prometheus endpoint (http://localhost:9090/api/v1/write if running Prometheus locally). Check K6 docs for other ways to configure the output target URL.
- Add "-o output-prometheus-remote" option when running K6.

## Running a scenario
k6 run .\scenario.js -o output-prometheus-remote
Replace scenario.js with your scenario: 
- first-visit-with-3pc.js: first visit using a browser that supports third party cookies.
- first-visit-with-no-3pc.js: first visit using a browser that doesn't support third party cookies.
- first-visit-with-no-3pc.js: using Safari for User-Agent. Has no effect for the moment.

