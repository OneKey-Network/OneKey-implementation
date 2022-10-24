const opentelemetry = require("@opentelemetry/sdk-node");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const {OTLPTraceExporter} = require("@opentelemetry/exporter-trace-otlp-http");
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const initStandardTracingConfig = () => {
    const getEnvVariable = (key, defaultValue) => {
        let value = process.env[key];
        if(value && typeof value === "string" && value.length > 0)
            return value;
        return defaultValue;
    };
    //Will use environment variables
    let activateMonitoring = getEnvVariable("ONEKEY_ACTIVATE_MONITORING", "false") === "true";
    if(!activateMonitoring){
        console.log("OpenTelemetry Tracing is disabled.")
        return;
    }
    let activateAutoInstrumentation = getEnvVariable("ONEKEY_ACTIVATE_AUTO_INSTRUMENTATION", "false") === "true";
    let activateHttpInstrumentation = getEnvVariable("ONEKEY_ACTIVATE_HTTP_INSTRUMENTATION", "false") === "true";
    let activateExpressInstrumentation = getEnvVariable("ONEKEY_ACTIVATE_EXPRESS_INSTRUMENTATION", "false") === "true";
    let serviceName = getEnvVariable("OTEL_SERVICE_NAME", "OneKey");
    let otlpEndpoint = getEnvVariable("OTEL_EXPORTER_OTLP_TRACES_ENDPOINT","http://localhost:4318/v1/traces");
    console.info("Starting OpenTelemetry Tracing using environment variables:");
    console.info(`ServiceName=${serviceName}`);
    console.info(`Endpoint=${otlpEndpoint}`);
    console.info(`AutoInstrumentation=${activateAutoInstrumentation}`);
    const description = new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: serviceName
    });
    const otlpExporter = new OTLPTraceExporter({url: otlpEndpoint, headers: {}});

    let instrumentations;
    if(activateAutoInstrumentation){
        instrumentations = getNodeAutoInstrumentations();
    }
    else{
        instrumentations = getNodeAutoInstrumentations().filter(m => (activateExpressInstrumentation && m.instrumentationName === "@opentelemetry/instrumentation-express") || (activateHttpInstrumentation && m.instrumentationName === "@opentelemetry/instrumentation-http"));
    }
    if(instrumentations.length > 0){
        console.info("Activated instrumentations:")
        instrumentations.map(e => console.info(e.instrumentationName));
    }
    const sdk = new opentelemetry.NodeSDK({
        resource: description,
        traceExporter: otlpExporter,
        instrumentations: instrumentations
    });
    sdk.start();
}

initStandardTracingConfig();