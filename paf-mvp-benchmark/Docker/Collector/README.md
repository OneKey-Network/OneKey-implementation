## Create a virtual network
docker network create observability-network

## Launch OTLP collector
Go to paf-mv-benchmark/Collector and run:\
`docker-compose up -d`\
Omit -d (detach option) to keep docker attached to current terminal.

## Viewer: Jaeger
http://localhost:16686/search
Jaeger is activated with the Monitor experimental feature.

