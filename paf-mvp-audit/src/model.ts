import { Field, FieldReadOnly, IFieldBind, IModel } from '@core/ui/fields';
import { AuditLog, TransmissionResult } from '@core/model/generated-model';
import { GetIdentityResponse } from '@core/model/generated-model';
import { FileExtensionInfo } from 'typescript';

/**
 * Represents a transmission result from the audit log with additional features to support a hierarchy, fetching
 * identity data, and verifying the signature.
 */
export class TransmissionResultNode {
  /**
   * Cached copy of the identity information for the domain associated with the result.
   */
  private identity: GetIdentityResponse = undefined;

  /**
   * The result returned in the audit log.
   */
  public readonly result: TransmissionResult;

  /**
   * Constructs a new instance of TransmissionResultNode for the audit log record provided.
   */
  constructor(result: TransmissionResult) {
    this.result = result;
  }

  /**
   * Identity of the transmission result.
   * @remarks this method gets the identity and all the public keys in a single method to avoid fetching the public key
   * and the other identity information over multiple requests to the same endpoint.
   * @returns promise that when resolved will provide the identity associated with the transmission result or an error.
   */
  public getIdentity() {
    if (this.identity === undefined) {
      return fetch(`https://${this.result.source.domain}/paf/v1/identity`, {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
      })
        .then((response) => {
          if (response) {
            return response.json() as Promise<GetIdentityResponse>;
          }
          throw new Error(response.statusText);
        })
        .then((identityResponse) => {
          this.identity = identityResponse;
          return identityResponse;
        });
    }
    return Promise.resolve(this.identity);
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
  readonly results: Field<TransmissionResultNode, Model>[] = [];

  /**
   * All the fields that need to be bound.
   */
  readonly allFields: IFieldBind[] = [];

  /**
   * The original raw audit log.
   */
  readonly auditLog: AuditLog;

  /**
   * Constructs the data model from the audit log.
   * @param auditLog
   */
  constructor(auditLog: AuditLog) {
    this.auditLog = auditLog;
    auditLog.transmissions?.forEach((t) => {
      const field = new Field<TransmissionResultNode, Model>(this, new TransmissionResultNode(t));
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

  /**
   * File name to use when downloading the audit log as JSON.
   */
  public get jsonFileName(): string {
    return this.fileNameNoExtension + '.json';
  }

  /**
   * File name to use when downloading the audit log.
   * @remarks must replace the colon with hyphen as it is not a valid file character.
   * Also replaces the dot in the domain name with hyphen to avoid problems with extension identification.
   */
  public get fileNameNoExtension(): string {
    const date = new Date(this.auditLog.seed.source.timestamp).toISOString().replace(':', '-');
    const publisher = this.auditLog.seed.publisher.replace('.', '-');
    return `audit-log-${publisher}-${date}`;
  }

  /**
   * The audit log as a JSON format string.
   */
  public get jsonContent(): string {
    return JSON.stringify(this.auditLog);
  }
}
