# Tracing:

## Links:
https://opentelemetry.io/docs/instrumentation/js/getting-started/nodejs/

## Install npm packages:
### OpenTelemetry 
```
npm install @opentelemetry/sdk-node @opentelemetry/sdk-node
npm install @opentelemetry/sdk-node @opentelemetry/api
npm install @opentelemetry/exporter-trace-otlp-http
npm install @opentelemetry/resources
npm install @opentelemetry/semantic-conventions
```

### Auto instrumentation (most used packages all-in-one)
This has a impact on the starting time.\
`npm install @opentelemetry/auto-instrumentations-node`

## Configure and Run
### Choose exporters:
Exporters are configured using OneKey and [OpenTelemetry environment variables](https://opentelemetry.io/docs/reference/specification/sdk-environment-variables/).\
ONEKEY_ACTIVATE_MONITORING: true or false\
ONEKEY_ACTIVATE_AUTO_INSTRUMENTATION: true or false\
OTEL_SERVICE_NAME: service name\
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: OTLP endpoint\
Using environment variables is partly experimental. Check implementation in tracing.js file and OpenTelemetry for more details.

### Choose instrumentation modules:
ONEKEY implements a basic instrumentation based on endpoint names. It doesn't currently support context propagation.
Monitoring is controlled by ONEKEY_ACTIVATE_MONITORING environment variable.\
ONEKEY_ACTIVATE_AUTO_INSTRUMENTATION: If set to true, all instrumentation modules are activated.\
ONEKEY_ACTIVATE_HTTP_INSTRUMENTATION: Activates HTTP instrumentation is set to true and auto instrumentation is disabled.\
ONEKEY_ACTIVATE_EXPRESS_INSTRUMENTATION: Activates Express instrumentation is set to true and auto instrumentation is disabled.\
Auto instrumentation is disabled by default. Included in auto instrumentation:
- @opentelemetry/instrumentation-amqplib
- @opentelemetry/instrumentation-aws-lambda
- @opentelemetry/instrumentation-aws-sdk
- @opentelemetry/instrumentation-bunyan
- @opentelemetry/instrumentation-cassandra-driver
- @opentelemetry/instrumentation-connect
- @opentelemetry/instrumentation-dataloader
- @opentelemetry/instrumentation-dns
- @opentelemetry/instrumentation-express
- @opentelemetry/instrumentation-fastify
- @opentelemetry/instrumentation-generic-pool
- @opentelemetry/instrumentation-graphql
- @opentelemetry/instrumentation-grpc
- @opentelemetry/instrumentation-hapi
- @opentelemetry/instrumentation-http
- @opentelemetry/instrumentation-ioredis
- @opentelemetry/instrumentation-knex
- @opentelemetry/instrumentation-koa
- @opentelemetry/instrumentation-lru-memoizer
- @opentelemetry/instrumentation-memcached
- @opentelemetry/instrumentation-mongodb
- @opentelemetry/instrumentation-mongoose
- @opentelemetry/instrumentation-mysql2
- @opentelemetry/instrumentation-mysql
- @opentelemetry/instrumentation-nestjs-core
- @opentelemetry/instrumentation-net
- @opentelemetry/instrumentation-pg
- @opentelemetry/instrumentation-pino
- @opentelemetry/instrumentation-redis
- @opentelemetry/instrumentation-redis-4
- @opentelemetry/instrumentation-restify
- @opentelemetry/instrumentation-winston


### Activate Tracing:
To start tracing for paf-mvp-demo-express:\
`npm run`
All services inherited from class Node are monitored.

### Viewers
A docker image with a collector, Jaeger and Prometheus is given under paf-mvp-benchmark.\
Default viewer is accessible at [Jaeger UI](http://localhost:16686/search).