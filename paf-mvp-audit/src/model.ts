import { FieldReadOnly, IFieldBind } from './fields';
import { AuditLog } from '@core/model/generated-model';

/**
 * Field represents the
 */
export class FieldAuditLog extends FieldReadOnly<AuditLog> implements IFieldBind {}

/**
 * The model used in the module.
 */
export class Model {
  // Set to true when model update operations are occurring. Results in the
  // methods to update other properties being disabled.
  settingValues = false;

  // The data fields that relate to the data model.
  readonly auditLog: FieldAuditLog;

  // All the fields that need to be bound.
  readonly allFields: IFieldBind[];

  // Constructs the data model from the audit log.
  constructor(auditLog: AuditLog) {
    this.auditLog = auditLog;
    this.allFields = [this.auditLog];
  }

  /**
   * Calls the bind method on all the fields in the model to connect them to the currently displayed UI.
   */
  public bind() {
    this.allFields.forEach((f) => f.bind());
  }
}
