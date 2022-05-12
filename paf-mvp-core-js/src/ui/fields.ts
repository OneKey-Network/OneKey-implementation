import { IBindingField } from './binding';

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

export interface IFieldBind {
  refresh(): void;
}

export interface IFieldReset {
  reset(): void;
  get hasChanged(): boolean;
}

export interface IModel {
  /**
   * Indicates that the model is being updated.
   */
  get settingValues(): boolean;
  set settingValues(value: boolean);

  /**
   * Refreshes the user interface based on the current state of the model.
   */
  refresh(): void;
}

export abstract class FieldReadOnly<T, M extends IModel> implements IFieldBind {
  // List of bindings to HTML elements for the field.
  protected bindings: IBindingField<T, M>[] = [];

  // The model the field is part of.
  protected readonly model: M;

  /**
   * Constructs a new instance of the readonly field for the model.
   * @param model
   */
  constructor(model: M) {
    this.model = model;
  }

  /**
   * Refreshes the elements that are associated with the field to the field so that when the value changes the HTML
   * elements are updated and vice versa.
   */
  refresh() {
    this.bindings.forEach((b) => b.refresh());
  }

  /**
   * Add a new binding for the field and set the correct value. Sets the binding to this field, and then adds the
   * binding to the list for the field.
   * @param binding
   */
  addBinding(binding: IBindingField<T, M>) {
    binding.setField(this);
    this.bindings.push(binding);
  }
}

/**
 * Field that can be bound to an HTML element.
 */
export abstract class Field<T, M extends IModel> extends FieldReadOnly<T, M> implements IFieldReset {
  // The default value for the field. Used when the field is reset.
  private readonly defaultValue: T;

  // The current value of the field used with the getter and setter.
  private _value: T;

  // The first value that was passed to set value. Used to determine if the field has changed.
  protected firstValue: T = undefined;

  /**
   * The model and default value for the field.
   * @param model
   * @param defaultValue
   */
  constructor(model: M, defaultValue: T) {
    super(model);
    this.defaultValue = defaultValue;
    this.reset();
  }

  /**
   * Called after the set value for this field has been actioned to determine if other fields in the model need to be
   * altered.
   */
  protected abstract updateOthers(): void;

  /**
   * True if the value of the field has changed since the first time it was set.
   */
  public get hasChanged(): boolean {
    return this.firstValue !== undefined && this.value !== this.firstValue;
  }

  /**
   * Gets the current value.
   */
  public get value(): T {
    return this._value;
  }

  /**
   * Sets the current value, updating any HTML elements that match the name value, then checks to see if any other
   * fields need to be updated if the model is not already in a setting values operation.
   */
  public set value(value: T) {
    this._value = value;
    if (this.firstValue === undefined) {
      this.firstValue = value;
    }
    if (this.model.settingValues === false) {
      this.model.settingValues = true;
      this.updateOthers();
      this.model.settingValues = false;
    }
    this.model.refresh();
  }

  /**
   * True if the field is disabled and can't have it's value changed. Should be overridden in inheriting classes if the
   * ability to disable a field is needed.
   */
  public get disabled(): boolean {
    return false;
  }

  /**
   * Ensures the UI components are updated if the disabled status of the field changes.
   */
  public set disabled(value: boolean) {
    this.bindings.forEach((b) => b.refresh());
  }

  /**
   * Resets the field to the original value.
   */
  reset() {
    this.value = this.defaultValue;
    this.firstValue = undefined;
  }

  /**
   * Add a new binding for the field and set the correct value. Sets the binding to this field, sets the value of the
   * HTML element to the current value of the field, and then adds the binding to the list for the field.
   */
  addBinding(binding: IBindingField<T, M>) {
    super.addBinding(binding);
    binding.refresh();
  }
}
