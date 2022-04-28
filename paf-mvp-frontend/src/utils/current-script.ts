class CurrentScript {
  private currentScript: HTMLScriptElement;

  setScript(target: HTMLScriptElement) {
    this.currentScript = target;
  }

  getSource(): string {
    return this.currentScript?.src;
  }

  getData(): DOMStringMap {
    return this.currentScript?.dataset;
  }

  getParent() {
    return this.currentScript.parentElement;
  }
}

export const currentScript = new CurrentScript();
