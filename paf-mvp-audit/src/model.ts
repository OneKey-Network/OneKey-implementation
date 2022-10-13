import { Field, IFieldBind, IModel } from '@onekey/core/ui/fields';
import { AuditLog, GetIdentityResponse, Seed, TransmissionResult } from '@onekey/core/model/generated-model';
import { HttpService, IHttpService } from '@onekey/frontend/services/http.service';
import { GetIdentityRequestBuilder } from '@onekey/core/model';

export interface AuditLine {
  name: string;
  isValid?: boolean;
  dpoEmailAddress?: string;
  privacyUrl?: string;
}

export abstract class FieldAuditLine extends Field<AuditLine, Model> implements IFieldBind {
  constructor(model: Model, private domain: string, private httpService: IHttpService = new HttpService()) {
    super(model, null);
  }

  async populateValues() {
    const domain = this.domain;

    const queryBuilder = new GetIdentityRequestBuilder(domain);
    const request = queryBuilder.buildRequest();
    const url = queryBuilder.getRestUrl(request);

    try {
      const identity = JSON.parse(await (await this.httpService.get(url.toString())).text()) as GetIdentityResponse;
      this.value = {
        name: identity.name,
        dpoEmailAddress: identity.dpo_email,
        privacyUrl: identity.privacy_policy_url,
      };
    } catch (e) {
      this.value = {
        name: domain,
        isValid: false,
      };
    }
  }
}

/**
 * Field represents the transmission result from the audit log.
 */
export class FieldTransmissionResult extends FieldAuditLine {
  constructor(
    model: Model,
    private transmissionResult: TransmissionResult,
    httpService: IHttpService = new HttpService()
  ) {
    super(model, transmissionResult.source.domain, httpService);
  }
}

/**
 * Field represents the seed the audit log.
 */
export class FieldSeed extends FieldAuditLine {
  constructor(model: Model, private seed: Seed, httpService: IHttpService = new HttpService()) {
    super(model, seed.source.domain, httpService);
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

  constructor(private httpService: IHttpService = new HttpService()) {}

  async addField(field: FieldAuditLine) {
    await field.populateValues();

    this.results.push(field);
    this.allFields.push(field);
  }

  async build(audit: AuditLog) {
    await this.addField(new FieldSeed(this, audit.seed, this.httpService));

    for (const t of audit.transmissions) {
      await this.addField(new FieldTransmissionResult(this, t, this.httpService));
    }
  }

  /**
   * Calls the updateUI method on all the fields in the model to connect them to the currently displayed UI.
   */
  public updateUI() {
    this.allFields?.forEach((f) => f.updateUI());
  }
}
