import { Config } from './config';
import { BindingViewOnly } from '@onekey/core/ui/binding';
import { Identifier, PreferencesData } from '@onekey/core/model/generated-model';
import { Marketing, Model } from './model';
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
 * Custom UI binding to hide or show the div that displays the random identifier if preferences have been set.
 */
export class BindingShowRandomIdDiv extends BindingViewOnly<PreferencesData, Model, HTMLDivElement> {
  protected readonly model: Model;

  constructor(view: View, id: string, model: Model) {
    super(view, id);
    this.model = model;
  }

  /**
   * If the this site only check field is true, or marketing preferences are not standard or personalized then don't
   * display the random id.
   */
  public refresh(): HTMLDivElement {
    const element = super.getElement();
    if (element !== null) {
      element.style.display =
        this.model.onlyThisSite.value === false &&
        (Marketing.equals(this.model.pref.value, Marketing.standard) ||
          Marketing.equals(this.model.pref.value, Marketing.personalized))
          ? ''
          : 'none';
    }
    return element;
  }
}

/**
 * Custom UI binding to display the random identifier in the button used to reset it.
 */
export class BindingDisplayRandomId extends BindingViewOnly<Identifier, Model, HTMLSpanElement> {
  /**
   * Adds the identifier text to the bound elements inner text.
   */
  public refresh(): HTMLSpanElement {
    const element = super.getElement();
    if (element !== null) {
      if (this.field.value) {
        element.innerText = this.field.value.value.substring(0, 6);
      } else {
        element.innerText = '';
      }
    }
    return element;
  }
}
