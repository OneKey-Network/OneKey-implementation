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

/**
 * A field that can be bound to a UI element.
 */
export interface IFieldBind {
  /**
   * Refreshes the bound UI elements to reflect the current state of the model.
   */
  updateUI(): void;
}

/**
 * A field that can be changed.
 */
export interface IFieldChangable {
  /**
   * Resets the field to the default value.
   */
  reset(): void;

  /**
   * True if the field now has a different value than the initial value.
   */
  get hasChanged(): boolean;
}

/**
 * The common properties for all models.
 */
export interface IModel {
  /**
   * Indicates the model is being updated.
   */
  get settingValues(): boolean;
  set settingValues(value: boolean);

  /**
   * Refreshes the bound UI elements to reflect the current state of the model.
   */
  updateUI(): void;
}

/**
 * Readonly base field class with features to bind the data to the UI elements only.
 */
export abstract class FieldReadOnly<T, M extends IModel> implements IFieldBind {
  /**
   * Bindings to HTML elements associated with the field.
   */
  protected bindings: IBindingField<T, M>[] = [];

  /**
   * Model the field is part of.
   */
  protected readonly model: M;

  /**
   * Constructs a new instance of the readonly field for the model.
   * @param model
   */
  constructor(model: M) {
    this.model = model;
  }

  /**
   * Refreshes the bound UI elements to reflect the current state of the model.
   */
  public updateUI() {
    this.bindings.forEach((b) => b.refresh());
  }

  /**
   * Add a new binding for the field and set the correct value. Sets the binding to this field, and then adds the
   * binding to the list for the field.
   * @param binding
   */
  public addBinding(binding: IBindingField<T, M>) {
    binding.setField(this);
    this.bindings.push(binding);
  }
}

/**
 * Field that can be bound to an HTML element and which might alter other fields in the model.
 */
export class Field<T, M extends IModel> extends FieldReadOnly<T, M> implements IFieldChangable {
  /**
   * The default value for the field. Used when the field is reset.
   */
  private readonly defaultValue: T;

  /**
   *  The current value of the field used with the getter and setter.
   */
  private _value: T;

  /**
   * The value, if any, that is currently persisted to storage. Used to determine if the field value has changed.
   */
  private _persistedValue: T = undefined;

  /**
   * True if the field is disabled and can't have it's value changed, otherwise false. Defaults to false.
   */
  private _disabled = false;

  /**
   * Constructs a new instance of the readonly field for the model with the default value.
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
  protected updateOthers() {
    // Do nothing in base implementation
  }

  /**
   * True if the field value is associated with a persisted and signed value.
   */
  public get hasPersisted(): boolean {
    return this.persistedValue !== undefined;
  }

  /**
   * Returns true if;
   * - there is no persisted value and needs to be persisted; or
   * - there is a persisted value and the current value is not equal to it.
   * Otherwise false.
   * @remarks should be overridden if the default equality operator should not be used.
   */
  public get hasChanged(): boolean {
    return this.persistedValue === undefined || this.value !== this.persistedValue;
  }

  /**
   * Gets the current value.
   */
  public get value(): T {
    return this._value;
  }

  /**
   * Sets the current value, then checks to see if any other fields need to be updated if the model is not already in a
   * setting values operation. Finally updates any UI elements bound to the model.
   * @remarks if the field is disabled an exception is thrown.
   */
  public set value(value: T) {
    if (this._disabled) {
      throw "Can't set value of disabled field";
    }
    this._value = value;
    if (this.model.settingValues === false) {
      this.model.settingValues = true;
      this.updateOthers();
      this.model.settingValues = false;
    }
    this.model.updateUI();
  }

  /**
   * Gets the value that was persisted, or undefined if there is no persisted value.
   */
  public get persistedValue(): T | undefined {
    return this._persistedValue;
  }

  /**
   * Sets the current value and the persisted value, then checks to see if any other fields need to be updated if the
   * model is not already in a setting values operation. Finally updates any UI elements bound to the model.
   * Should be used instead of the value property when setting a value from persisted storage.
   */
  public set persistedValue(value: T) {
    this._persistedValue = value;
    this.value = value;
  }

  /**
   * True if the field is disabled and can't have it's value changed. Should be overridden in inheriting classes if the
   * ability to disable a field is needed.
   */
  public get disabled(): boolean {
    return this._disabled;
  }

  /**
   * Ensures the UI components are updated if the disabled status of the field changes.
   */
  public set disabled(value: boolean) {
    this._disabled = value;
    this.bindings.forEach((b) => b.refresh());
  }

  /**
   * Resets the field value to the default value.
   */
  reset() {
    this.value = this.defaultValue;
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
