export interface ScriptElement<T> {
  src?: string;
  dataset: T;
  parentElement: HTMLElement;
}

export class CurrentScript<T extends DOMStringMap> {
  private currentScript: ScriptElement<T>;

  setScript(target: ScriptElement<DOMStringMap>) {
    this.currentScript = target as ScriptElement<T>;
  }

  getSource(): string {
    return this.currentScript?.src;
  }

  getData(): T {
    return this.currentScript?.dataset as T;
  }

  getParent(): HTMLElement {
    return this.currentScript.parentElement;
  }
}

export const currentScript = new CurrentScript();
