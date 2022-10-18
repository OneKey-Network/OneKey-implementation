import {
  trace,
  Tracer,
  Span,
  SpanOptions,
  SpanContext,
  SpanStatus,
  Attributes as SpanAttributes,
  AttributeValue as SpanAttributeValue,
  TimeInput,
  Context,
  Exception,
} from '@opentelemetry/api';

class NoopSpanContext implements SpanContext {
  spanId: string;
  traceFlags: number;
  traceId: string;
}

class NoopSpan implements Span {
  private _spanContext: SpanContext = new NoopSpanContext();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addEvent(name: string, attributesOrStartTime?: SpanAttributes | TimeInput, startTime?: TimeInput): this {
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
  end(endTime?: TimeInput): void {}
  isRecording(): boolean {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
  recordException(exception: Exception, time?: TimeInput): void {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setAttribute(key: string, value: SpanAttributeValue): this {
    return this;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setAttributes(attributes: SpanAttributes): this {
    return this;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setStatus(status: SpanStatus): this {
    return this;
  }
  spanContext(): SpanContext {
    return this._spanContext;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateName(name: string): this {
    return this;
  }
}

class NoopTracer implements Tracer {
  private _noopSpan = new NoopSpan();
  startActiveSpan<F extends (span: Span) => unknown>(name: string, fn: F): ReturnType<F>;
  startActiveSpan<F extends (span: Span) => unknown>(name: string, options: SpanOptions, fn: F): ReturnType<F>;
  startActiveSpan<F extends (span: Span) => unknown>(
    name: string,
    options: SpanOptions,
    context: Context,
    fn: F
  ): ReturnType<F>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  startActiveSpan(name: string, options?: SpanOptions, context?: Context): Span {
    return this._noopSpan;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  startSpan(name: string, options?: SpanOptions, context?: Context): Span {
    return this._noopSpan;
  }
}

interface TracerFactoryImplementation {
  getTracer(serviceName: string): Tracer;
}

class NoopTracerFactory implements TracerFactoryImplementation {
  private _noopTracer = new NoopTracer();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getTracer(serviceName: string): Tracer {
    return this._noopTracer;
  }
}
class OpenTelemetryTracerFactory implements TracerFactoryImplementation {
  public getTracer(serviceName: string): Tracer {
    return trace.getTracer(serviceName);
  }
}
export class TracerFactory {
  private static _implementation: TracerFactoryImplementation;
  private static getInstance(): TracerFactoryImplementation {
    if (!TracerFactory._implementation) {
      const activateMonitoring = process.env['ONEKEY_ACTIVATE_MONITORING'];
      if (activateMonitoring && activateMonitoring === 'true') {
        TracerFactory._implementation = new OpenTelemetryTracerFactory();
        console.info('OpenTelemetryTracerFactory created');
      } else {
        TracerFactory._implementation = new NoopTracerFactory();
        console.info('NoopTracerFactory created');
      }
    }
    return TracerFactory._implementation;
  }
  public static getTracer(serviceName: string): Tracer {
    return TracerFactory.getInstance().getTracer(serviceName);
  }
}
