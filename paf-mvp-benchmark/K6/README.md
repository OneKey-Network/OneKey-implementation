# OneKey Capacity Planning

## Toolkit
K6 load testing tools:\
- [K6 Official Documentation](https://k6.io/docs/)
- [A useful summary](https://pflb.us/blog/k6-user-manual/)

K6_PROMETHEUS_REMOTE_URL=http://localhost:9090/api/v1/write

k6 run .\scenarios.js -o output-prometheus-remote

