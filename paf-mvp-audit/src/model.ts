import { Field, IFieldBind, IModel } from '@onekey/core/ui/fields';
import { AuditLog, GetIdentityResponse, TransmissionResult } from '@onekey/core/model/generated-model';
import { HttpService, IHttpService } from '@onekey/frontend/services/http.service';
import { GetIdentityRequestBuilder } from '@onekey/core/model';

export interface ValidatedTransmissionResult extends TransmissionResult {
  name?: string;
  isValid?: boolean;
  dpoEmailAddress?: string;
  privacyUrl?: string;
}

/**
 * Field represents the transmission result from the audit log.
 */
export class FieldTransmissionResult extends Field<ValidatedTransmissionResult, Model> implements IFieldBind {
  constructor(
    model: Model,
    transmissionResult: TransmissionResult,
    private httpService: IHttpService = new HttpService()
  ) {
    super(model, transmissionResult);
  }

  async validate() {
    const queryBuilder = new GetIdentityRequestBuilder(this.value.receiver);
    const request = queryBuilder.buildRequest();
    const url = queryBuilder.getRestUrl(request);

    try {
      const identity = JSON.parse(await (await this.httpService.get(url.toString())).text()) as GetIdentityResponse;
      console.log(identity);
      this.value.name = identity.name;
      this.value.dpoEmailAddress = identity.dpo_email;
      this.value.privacyUrl = identity.privacy_policy_url;
    } catch (e) {
      // FIXME update model as a failure in case cannot get identity
    }
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
  readonly results: FieldTransmissionResult[] = [];

  /**
   * All the fields that need to be bound.
   */
  readonly allFields: IFieldBind[] = [];

  constructor(private httpService: IHttpService = new HttpService()) {}

  async build(audit: AuditLog) {
    for (const t of audit.transmissions) {
      const field = new FieldTransmissionResult(this, t, this.httpService);

      await field.validate();

      this.results.push(field);
      this.allFields.push(field);
    }
  }

  /**
   * Calls the updateUI method on all the fields in the model to connect them to the currently displayed UI.
   */
  public updateUI() {
    this.allFields?.forEach((f) => f.updateUI());
  }
}
