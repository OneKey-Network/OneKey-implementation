import { Field, FieldReadOnly, IModel } from './fields';

/**
 * Copyright 2021 51Degrees Mobile Experts Limited
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Contains common bindings used between fields in the data model and UI elements.
 */

/**
 * Used to create an array of fields that can be used with data binding to the UI.
 */
export interface IBindingField<T, M extends IModel> {
  /**
   * Informs the binding that something about the field status has changed and the UI should refresh.
   */
  refresh(): void;

  /**
   * The field that the binding relates to.
   * @param field
   */
  setField(field: FieldReadOnly<T, M>): void;
}

/**
 * Interface that the view must implement to expose the shadow root.
 */
export interface IView {
  /**
   * Returns the shadow root that all elements that will be bound to will be found under.
   */
  get root(): ShadowRoot;
}

/**
 * Base class used for all binding classes containing common functionality.
 */
export abstract class BindingBase<E extends HTMLElement> {
  /**
   * The view that will contain the element with the id.
   */
  protected readonly view: IView;

  /**
   * Id of the HTML elements that the field is bound to.
   */
  private readonly id: string;

  /**
   * Constructs a new field binding the field in the model to an HTML element of the id. i.e. "model-field", or
   * "model-preference". The id should be unique within the DOM.
   * @param view that will contain the element with the id
   * @param id of the id of the element to bind to
   */
  constructor(view: IView, id: string) {
    this.view = view;
    this.id = id;
  }

  /**
   * Gets the HTML elements that match the id from the document.
   * @returns first element that matches the id
   */
  protected getElement(): E {
    if (this.view.root !== null) {
      return <E>this.view.root.getElementById(this.id);
    }
    return null;
  }
}

/**
 * Binding used only to display the value of a field and not update it.
 */
export abstract class BindingViewOnly<T, M extends IModel, E extends HTMLElement> extends BindingBase<E> {
  /**
   * The field that the binding relates to. Set when the binding is added to the field.
   */
  protected field: Field<T, M> | null = null;

  /**
   * Sets the UI of the bound element to reflect the value in the field. Must be implemented in the inheriting class to
   * update the UI element for the specific field in question. Some times complex types require manipulation before
   * display or are set in the UI via attributes or other methods meaning a "one size fits all" solution isn't possible.
   * @returns the element that was refreshed if it exists
   */
  abstract refresh(): E;

  /**
   * Sets the field that the binding is associated with.
   * @param field to associate with the UI element
   */
  public setField(field: Field<T, M>) {
    this.field = field;
  }
}

/**
 * Binding used only to display the value of a field and provide a feedback mechanism to update it.
 */
export abstract class BindingReadWrite<T, M extends IModel, E extends HTMLElement> extends BindingViewOnly<T, M, E> {
  /**
   * The events that the binding is interested in listening to.
   */
  protected abstract events: string[];

  /**
   * Returns the value as stored in the instance of the element provided and not in the field.
   * @param element
   */
  protected abstract getValue(element: E): T;

  /**
   * Handles the event from the UI element. Can be overridden by the inheriting class.
   * @remarks must be an event object so that the add and remove listener methods don't create anoymous objects and
   * therefore add multiple listeners for the same element and field.
   * @param e event
   */
  private eventHandler = (e: Event) => {
    const element = <E>e.target;
    if (this.field && this.field.disabled === false) {
      this.field.value = this.getValue(element);
    }
  };

  /**
   * Binds all the elements to the events that matter for the binding.
   * @remarks removes any previous event listener before adding the new one to prevent the same event firing multiple
   * times.
   * @returns the element that was refreshed if it exists
   */
  public refresh(): E {
    const element = super.getElement();
    if (element !== null) {
      this.events.forEach((event) => {
        element.removeEventListener(event, this.eventHandler);
        element.addEventListener(event, this.eventHandler);
      });
    }
    return element;
  }
}

/**
 * A boolean field type that is used with an HTMLInputElement and the checked property. Includes support for radio
 * options not part of a group and check boxes.
 */
export class BindingChecked<M extends IModel>
  extends BindingReadWrite<boolean, M, HTMLInputElement>
  implements IBindingField<boolean, M>
{
  protected events: string[] = ['change'];

  protected getValue(element: HTMLInputElement): boolean {
    return element.checked;
  }

  public refresh(): HTMLInputElement {
    const element = super.refresh();
    if (element !== null) {
      element.checked = this.field.value;
      element.disabled = this.field.disabled;
    }
    return element;
  }
}

/**
 * Where a map contains many keys the true and the false keys are used to manipulate which key is selected when the
 * UI element is checked or unchecked.
 */
export class BindingCheckedMap<T, M extends IModel>
  extends BindingReadWrite<T, M, HTMLInputElement>
  implements IBindingField<T, M>
{
  protected events: string[] = ['change'];
  protected readonly trueValue: T;
  protected readonly falseValue: T;

  /**
   * Constructs a new instance of the BindingCheckMap<T> class.
   * @param view that will contain the element with the id
   * @param id of the id of the element to bind to
   * @param trueValue the value of the field that will result in the element being checked
   * @param falseValue the value of the field that will result in the element being unchecked
   */
  constructor(view: IView, id: string, trueValue: T, falseValue: T) {
    super(view, id);
    this.trueValue = trueValue;
    this.falseValue = falseValue;
  }

  /**
   * If the element is checked then returns the trueValue, otherwise falseValue.
   * @param element bound to
   * @returns
   */
  protected getValue(element: HTMLInputElement): T {
    return element.checked ? this.trueValue : this.falseValue;
  }

  /**
   * Sets the input checked property to true if the value matches the trueValue otherwise unchecked.
   * @remarks
   * JSON string comparison method is needed for non native types where we want to compare the value for equality
   * rather than the reference to the instance.
   */
  public refresh(): HTMLInputElement {
    const element = super.refresh();
    if (element !== null) {
      element.checked = JSON.stringify(this.field.value) === JSON.stringify(this.trueValue);
    }
    return element;
  }
}

/**
 * Binds a field with different values to display HTML. Used to change the contents of content elements based on the
 * current state of fields that can have a known number of values.
 * @remarks
 * The key comparison is performed using JSON.Stringify to compare keys by value.
 */
export class BindingElement<T, M extends IModel>
  extends BindingViewOnly<T, M, HTMLElement>
  implements IBindingField<T, M>
{
  /**
   * Array of key value pairs.
   */
  protected readonly pairs: [T, string][];

  /**
   * Relates any HTML element with the innerHTML property to a map of keys and locale string values.
   * @param view that will contain the element with the id
   * @param id of the id of the element to bind to
   * @param map of field values to locale strings
   */
  constructor(view: IView, id: string, map: Map<T, string>) {
    super(view, id);
    this.pairs = Array.from(map);
  }

  public refresh(): HTMLElement {
    const element = super.getElement();
    if (element !== null) {
      const text = this.getString(this.field.value);
      if (text !== null) {
        element.innerHTML = text;
      } else {
        element.innerHTML = '';
      }
    }
    return element;
  }

  protected getString(key: T): string | null {
    const keyJSON = JSON.stringify(key);
    for (const item of this.pairs) {
      if (JSON.stringify(item[0]) === keyJSON) {
        return item[1];
      }
    }
    return null;
  }
}

/**
 * Binding used to set the button disabled state based on the value of the field. Used to enable save buttons only when
 * the data model is a state to support saving.
 */
export class BindingButton<M extends IModel> extends BindingViewOnly<boolean, M, HTMLButtonElement> {
  public refresh(): HTMLButtonElement {
    const element = super.getElement();
    if (element !== null) {
      element.disabled = this.field.value !== true;
    }
    return element;
  }
}
