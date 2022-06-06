import { Field, IFieldBind, IModel } from '@core/ui/fields';
import { AuditLog, TransmissionResult } from '@core/model/generated-model';

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
  readonly results: FieldTransmissionResult[];

  /**
   * All the fields that need to be bound.
   */
  readonly allFields: IFieldBind[];

  /**
   * Constructs the data model from the audit log.
   * @param audit
   */
  constructor(audit: AuditLog) {
    this.results = [];
    for (let i = 0; i < audit.transmissions.length; i++) {
      this.results.push(new FieldTransmissionResult(this, audit.transmissions[i]));
    }
    this.allFields = this.results;
  }

  /**
   * Calls the refresh method on all the fields in the model to connect them to the currently displayed UI.
   */
  public updateUI() {
    this.allFields.forEach((f) => f.updateUI());
  }
}
