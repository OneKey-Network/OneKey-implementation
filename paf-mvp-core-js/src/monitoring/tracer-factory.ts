import { trace, Tracer, Span, SpanOptions, SpanContext, Context } from '@opentelemetry/api';

class NoopSpan implements Span {
  addEvent(): this {
    return this;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  end(): void {}
  isRecording(): boolean {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  recordException(): void {}
  setAttribute(): this {
    return this;
  }
  setAttributes(): this {
    return this;
  }
  setStatus(): this {
    return this;
  }
  spanContext(): SpanContext {
    return {
      spanId: '',
      traceFlags: 0,
      traceId: '',
    };
  }
  updateName(): this {
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
  startActiveSpan(): Span {
    return this._noopSpan;
  }
  startSpan(): Span {
    return this._noopSpan;
  }
}

interface TracerFactoryImplementation {
  getTracer(serviceName: string): Tracer;
}

class NoopTracerFactory implements TracerFactoryImplementation {
  private _noopTracer = new NoopTracer();
  public getTracer(): Tracer {
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
