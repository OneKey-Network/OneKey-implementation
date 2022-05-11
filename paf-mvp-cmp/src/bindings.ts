import { Config } from './config';
import { BindingViewOnly } from '@core/ui/binding';
import { PreferencesData } from '@core/model/generated-model';
import { Model } from './model';
import { View } from './view';

/**
 * Hides the this site only option if the feature is not configured.
 */
export class BindingThisSiteOnly extends BindingViewOnly<boolean, Model, HTMLDivElement> {
  private readonly enabled: boolean;

  constructor(view: View, id: string, config: Config) {
    super(view, id);
    this.enabled = config.siteOnlyEnabled;
  }

  refresh(): HTMLDivElement {
    const element = super.getElement();
    if (element !== null) {
      element.style.display = this.enabled ? '' : 'none';
    }
    return element;
  }
}

/**
 * Custom UI binding to hide or show the area that displays the random identifier if preferences have been set.
 */
export class BindingShowRandomId extends BindingViewOnly<PreferencesData, Model, HTMLDivElement> {
  protected readonly model: Model;

  constructor(view: View, id: string, model: Model) {
    super(view, id);
    this.model = model;
  }

  /**
   * If the preferences are persisted then show the identifier.
   */
  public refresh(): HTMLDivElement {
    const element = super.getElement();
    if (element !== null) {
      const visible = this.field.value !== null && this.model.rid?.value?.value !== undefined;
      element.style.display = visible ? '' : 'none';
    }
    return element;
  }
}
