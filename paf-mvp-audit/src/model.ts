import { Field, IFieldBind, IModel } from '@onekey/core/ui/fields';
import { AuditLog, TransmissionResult } from '@onekey/core/model/generated-model';

/**
 * Field represents the transmission result from the audit log.
 */
export class FieldTransmissionResult extends Field<TransmissionResult, Model> implements IFieldBind {}

/**
 * The model used in the module.
 */
export class Model implements IModel {
  /**
   * Set to true when model update operations are occurring. Results in the methods to update other properties being
   * disabled.
   */
  settingValues = false;

  /**
   * The data fields that relate to each transmission result to be displayed.
   */
  readonly results: FieldTransmissionResult[] = [];

  /**
   * All the fields that need to be bound.
   */
  readonly allFields: IFieldBind[] = [];

  /**
   * Constructs the data model from the audit log.
   * @param audit
   */
  constructor(audit: AuditLog) {
    audit.transmissions?.forEach((t) => {
      const field = new FieldTransmissionResult(this, t);
      this.results.push(field);
      this.allFields.push(field);
    });
  }

  /**
   * Calls the updateUI method on all the fields in the model to connect them to the currently displayed UI.
   */
  public updateUI() {
    this.allFields?.forEach((f) => f.updateUI());
  }
}
