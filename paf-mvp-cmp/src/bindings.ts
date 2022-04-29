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

  public bind(): void {
    const element = this.getElement();
    if (element !== null) {
      element.style.display = this.enabled ? '' : 'none';
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setValue(value: boolean): void {
    // Do nothing.
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

  public bind(): void {
    if (this.field !== null) {
      this.setValue(this.field.value);
    }
  }

  /**
   * If the preferences are persisted then show the identifier.
   * @param value of the identifier being displayed
   */
  public setValue(value: PreferencesData) {
    const element = super.getElement();
    if (element !== null) {
      const visible = value !== null && this.model.rid?.value?.value !== undefined;
      element.style.display = visible ? '' : 'none';
    }
  }
}
