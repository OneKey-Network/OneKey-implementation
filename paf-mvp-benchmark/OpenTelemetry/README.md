# Tracing:

## Links:
https://opentelemetry.io/docs/instrumentation/js/getting-started/nodejs/

## Configure and Run

- start Jagger in Docker container, see [Docker](../Docker/Collector/README.md)

### Choose exporters:

Exporters are configured using OneKey and [OpenTelemetry environment variables](https://opentelemetry.io/docs/reference/specification/sdk-environment-variables/).\

```
ONEKEY_ACTIVATE_MONITORING: true or false
ONEKEY_ACTIVATE_AUTO_INSTRUMENTATION: true or false
OTEL_SERVICE_NAME: service name
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: OTLP endpoint
```

Using environment variables is partly experimental. Check implementation in [tracing.js](../OpenTelemetry/tracing.js) file and OpenTelemetry for more details.

### Choose instrumentation modules:
OneKey implements a basic instrumentation based on endpoint names. It doesn't currently support context propagation.
Monitoring is controlled by `ONEKEY_ACTIVATE_MONITORING` environment variable.

- `ONEKEY_ACTIVATE_AUTO_INSTRUMENTATION`: If set to `true`, all instrumentation modules are activated.
- `ONEKEY_ACTIVATE_HTTP_INSTRUMENTATION`: Activates HTTP instrumentation is set to `true` and auto instrumentation is disabled.
- `ONEKEY_ACTIVATE_EXPRESS_INSTRUMENTATION`: Activates Express instrumentation is set to `true` and auto instrumentation is disabled.

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
- activate tracing via environment variables:
```shell
export ONEKEY_ACTIVATE_MONITORING=true
export ONEKEY_ACTIVATE_AUTO_INSTRUMENTATION=false
```

- then check the [README](paf-mvp-demo-express/README.md) to start the demo.

All services inherited from class Node are monitored.

### Viewers
A docker image with a collector, Jaeger and Prometheus is given under paf-mvp-benchmark.\
Default viewer is accessible at [Jaeger UI](http://localhost:16686/search).
