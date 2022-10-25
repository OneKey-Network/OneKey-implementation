import { Field, IFieldBind, IModel } from '@onekey/core/ui/fields';
import { Seed, TransmissionResult } from '@onekey/core/model/generated-model';

export interface AuditLine {
  name: string;
  isValid?: boolean;
  dpoEmailAddress?: string;
  privacyUrl?: string;
}

/**
 * A field that holds values for a line of the audit log
 */
export abstract class FieldAuditLine extends Field<AuditLine, Model> implements IFieldBind {
  protected constructor(model: Model, public domain: string) {
    super(model, null);
  }
}

/**
 * Represents the transmission result from the audit log.
 */
export class FieldTransmissionResult extends FieldAuditLine {
  constructor(model: Model, private transmissionResult: TransmissionResult) {
    super(model, transmissionResult.source.domain);
  }
}

/**
 * Represents the seed of the audit log.
 */
export class FieldSeed extends FieldAuditLine {
  constructor(model: Model, private seed: Seed) {
    super(model, seed.source.domain);
  }
}

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
  readonly results: FieldAuditLine[] = [];

  /**
   * All the fields that need to be bound.
   */
  readonly allFields: IFieldBind[] = [];

  async addField(field: FieldAuditLine) {
    this.results.push(field);
    this.allFields.push(field);
  }

  /**
   * Calls the updateUI method on all the fields in the model to connect them to the currently displayed UI.
   */
  updateUI() {
    this.allFields?.forEach((f) => f.updateUI());
  }
}
