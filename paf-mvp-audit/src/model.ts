import { Field, IFieldBind, IModel } from '@core/ui/fields';
import { AuditLog, IdsAndPreferences, Seed, TransmissionResult } from '@core/model/generated-model';
import { GetIdentityResponse } from '@core/model/generated-model';
import { IdentityResolver } from './identity-resolver';
import { IdsAndPreferencesDefinition, IdsAndPreferencesVerifier, SeedSignatureContainer, Verifier } from '@core/crypto';
import { PublicKeyResolver } from './public-key-resolver';
import { SeedDefinition, TransmissionContainer, TransmissionDefinition } from './signing-definitions';
import { ILocale } from '@core/ui/ILocale';
import { getDate } from '@core/timestamp';

/**
 * Different status associated with fields in the model.
 */
export enum VerifiedStatus {
  IdentityNotFound = 'IdentityNotFound',
  Valid = 'Valid',
  NotValid = 'NotValid',
  Processing = 'Processing', // model verification is not complete
}

/**
 * Overall statuses that are used to determine what is communicated to the user.
 */
export enum OverallStatus {
  Good = 'Good', // all good
  Suspicious = 'Suspicious', // something suspicious but not a breach. i.e. 404 when fetching identity
  Violation = 'Violation', // proof that something bad has happened
  Processing = 'Processing', // model verification is not complete
}

/**
 * Used to hold a list of all the verified fields in the model.
 */
export interface IVerifiedValue {
  /**
   * Identity information associated with the source which is populated when the promise completes.
   * Returns undefined if the processing to establish identity is not complete.
   * Returns null if the processing completed but failed.
   */
  get identity(): GetIdentityResponse;

  /**
   * Gets the verified status of the field after the promises have resolved.
   * @returns the verified status of the field
   */
  get verifiedStatus(): VerifiedStatus;

  /**
   * Boolean field to indicate if the source signature is valid. Might be false if the source identity could not be
   * found or if the signature is invalid.
   * Returns undefined if the processing to establish validity is not complete.
   */
  get valid(): boolean;

  /**
   * Completes the verification process.
   */
  verify(): Promise<void>;
}

/**
 * Base class used by any value that can be signed. All signed values must have a source and therefore an identifier
 * will need to be fetched. This class handles the fetching of identity that will be the same for all signed values and
 * the subsequent request to verify the value.
 * @type T with a source that will be used with the signed value.
 */
export abstract class VerifiedValue<T> implements IVerifiedValue {
  /**
   * Identity information associated with the source which is populated when the promise completes.
   * Returns undefined if the processing to establish identity is not complete.
   * Returns null if the processing completed but failed.
   */
  public identity: GetIdentityResponse | null = undefined;

  /**
   * Boolean field to indicate if the source signature is valid. Might be false if the source identity could not be
   * found or if the signature is invalid.
   * Returns undefined if the processing to establish validity is not complete.
   */
  public valid: boolean = undefined;

  /**
   * Gets the verified status of the field after the promises have resolved.
   * @returns the verified status of the field
   */
  public get verifiedStatus(): VerifiedStatus {
    if (this.identity === undefined || this.valid === undefined) {
      return VerifiedStatus.Processing;
    }
    if (this.identity !== null && this.valid !== null) {
      return this.valid ? VerifiedStatus.Valid : VerifiedStatus.NotValid;
    }
    return VerifiedStatus.IdentityNotFound;
  }

  /**
   * A new instance of a verified value that will have commenced the process of verification.
   * @param identityPromise that may not yet be resolved to fetch the identity information
   * @param value the signed value that will be verified
   */
  constructor(private readonly identityPromise: Promise<GetIdentityResponse>, public readonly value: T) {}

  /**
   * Completes the verification process for the value.
   */
  public async verify() {
    try {
      this.identity = (await this.identityPromise) ?? null;
    } catch {
      this.identity = null;
    }
    if (this.identity) {
      this.valid = await this.verifySignature();
    } else {
      this.valid = false;
    }
  }

  /**
   * Method called to start the verification process once the identity has been obtained.
   */
  protected abstract verifySignature(): Promise<boolean>;
}

export class VerifiedSeed extends VerifiedValue<Seed> {
  /**
   * Static instance of the ids and preferences definition for use with the verifier.
   */
  private static readonly definition = new SeedDefinition();

  /**
   * Constructs a new instance of the verified ids and preferences value.
   * @param identityResolver used to retrieve identities for host names.
   * @param idsAndPreferences
   * @param seed
   */
  constructor(identityResolver: IdentityResolver, private readonly idsAndPreferences: IdsAndPreferences, seed: Seed) {
    super(identityResolver.get(seed.source.domain), seed);
  }

  protected verifySignature(): Promise<boolean> {
    const verifier = new Verifier<SeedSignatureContainer>(
      new PublicKeyResolver(this.identity).provider,
      VerifiedSeed.definition
    );
    return verifier.verifySignature({ seed: this.value, idsAndPreferences: this.idsAndPreferences });
  }
}

export class VerifiedIdsAndPreferences extends VerifiedValue<IdsAndPreferences> {
  /**
   * Static instance of the ids and preferences definition for use with the verifier.
   */
  private static readonly definition = new IdsAndPreferencesDefinition();

  /**
   * Constructs a new instance of the verified ids and preferences value.
   * @param identityResolver used to retrieve identities for host names.
   * @param idsAndPreferences
   */
  constructor(identityResolver: IdentityResolver, idsAndPreferences: IdsAndPreferences) {
    super(identityResolver.get(idsAndPreferences.preferences.source.domain), idsAndPreferences);
  }

  protected verifySignature(): Promise<boolean> {
    const verifier = new IdsAndPreferencesVerifier(
      new PublicKeyResolver(this.identity).provider,
      VerifiedIdsAndPreferences.definition
    );
    return verifier.verifySignature(this.value);
  }
}

/**
 * A verified transmission result from the audit log.
 */
export class VerifiedTransmissionResult extends VerifiedValue<TransmissionResult> {
  /**
   * Static instance of the ids and preferences definition for use with the verifier.
   */
  private static readonly definition = new TransmissionDefinition();

  /**
   * Constructs a new instance of TransmissionResultNode for the audit log record provided.
   * @param identityResolver used to retrieve identities for host names.
   * @param idsAndPreferences
   * @param seed
   * @param result returned in the audit log.
   */
  constructor(
    identityResolver: IdentityResolver,
    private readonly idsAndPreferences: IdsAndPreferences,
    private readonly seed: Seed,
    result: TransmissionResult
  ) {
    super(identityResolver.get(result.source.domain), result);
  }

  protected verifySignature(): Promise<boolean> {
    const verifier = new Verifier<TransmissionContainer>(
      new PublicKeyResolver(this.identity).provider,
      VerifiedTransmissionResult.definition
    );
    return verifier.verifySignature({ idsAndPreferences: this.idsAndPreferences, seed: this.seed, result: this.value });
  }

  /**
   * Builds the email hyperlink for the complaint method.
   * @param locale the email to complain about the signer of the transmission result
   * @returns a mail:>// URL to open an email message
   */
  public buildEmailUrl(locale: ILocale): string {
    const body = encodeURIComponent(
      (<string>locale.emailBodyText)
        .replace('[Name]', this.identity.name)
        .replace('[TimeStamp]', getDate(this.value.source.timestamp).toLocaleString())
        .replace('[PrivacyURL]', this.identity.privacy_policy_url)
        .replace('[PreferenceDate', getDate(this.idsAndPreferences.preferences.source.timestamp).toLocaleString())
        .replace(
          '[PreferenceText]',
          this.idsAndPreferences.preferences.data.use_browsing_for_personalization
            ? <string>locale.emailPreferencePersonalized
            : <string>locale.emailPreferenceStandard
        )
        .replace('[Proof]', JSON.stringify(this.value))
        .trim()
    );
    const subject = encodeURIComponent(<string>locale.emailSubject);
    return `mailto:${this.identity.dpo_email}?subject=${subject}&body=${body}`;
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
  readonly results: Field<VerifiedTransmissionResult, Model>[] = [];

  /**
   * Verified field for the seed.
   */
  readonly seed: Field<VerifiedSeed, Model>;

  /**
   * Verified field for the ids and preferences.
   */
  readonly idsAndPreferences: Field<VerifiedIdsAndPreferences, Model>;

  /**
   * All the fields that relate to verified values.
   */
  readonly allVerifiedFields: Field<IVerifiedValue, Model>[] = [];

  /**
   * All the fields that need to be bound.
   */
  readonly allFields: IFieldBind[] = [];

  /**
   * Overall status of the model updated after verify.
   */
  readonly overall = new Field<OverallStatus, Model>(this, OverallStatus.Processing);

  /**
   * Constructs the data model from the audit log starting the promises to retrieve identity and then verify the values.
   * @remarks The model must not be used until the promise returned from the verify() method resolves.
   * @param auditLog the original raw audit log.
   * @param identityResolver used to retrieve identities for host names.
   */
  constructor(identityResolver: IdentityResolver, private readonly auditLog: AuditLog) {
    // Create the field for the seed and add the value to the list of values being verified.
    this.seed = new Field<VerifiedSeed, Model>(this, new VerifiedSeed(identityResolver, auditLog.data, auditLog.seed));
    this.allVerifiedFields.push(this.seed);

    // Create the field for the ids and preferences and add the value to the list of values being verified.
    this.idsAndPreferences = new Field<VerifiedIdsAndPreferences, Model>(
      this,
      new VerifiedIdsAndPreferences(identityResolver, auditLog.data)
    );
    this.allVerifiedFields.push(this.idsAndPreferences);

    // Loop through the transmission results adding fields to the model and adding the value to the values being
    // verified.
    auditLog.transmissions?.forEach((result) => {
      this.AddTransmissionField(identityResolver, auditLog, result);
    });
  }

  /**
   * Should be called straight after the constructor to complete all verification processing.
   * @remarks All identity and verification promises will have been settled once the promise resolves.
   * @returns an instance of this model
   */
  public async verify(): Promise<Model> {
    if (this.verifyComplete === false) {
      for (let i = 0; i < this.allVerifiedFields.length; i++) {
        await this.allVerifiedFields[i].value.verify();
      }
      this.overall.value = this.getOverall();
      this.verifyComplete = true;
    }
    return this;
  }
  private verifyComplete = false;

  /**
   * Counts the number of fields with a given status.
   * @returns
   */
  public count(match: VerifiedStatus): number {
    let count = 0;
    this.allVerifiedFields.forEach((field) => {
      if (field.value.verifiedStatus === match) {
        count++;
      }
    });
    return count;
  }

  /**
   * Checks all the verifiable fields and determines the overall status for the audit log.
   * @returns the overall status for the audit log
   */
  public getOverall(): OverallStatus {
    if (
      this.allVerifiedFields.every((s) => s.value.verifiedStatus === VerifiedStatus.Valid) &&
      this.results.every((s) => s.value.value.status === 'success')
    ) {
      return OverallStatus.Good;
    }
    if (this.allVerifiedFields.some((s) => s.value.verifiedStatus === VerifiedStatus.NotValid)) {
      return OverallStatus.Violation;
    }
    return OverallStatus.Suspicious;
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

  /**
   * Adds the transmission field to the model.
   * @param identityResolver
   * @param auditLog
   * @param result
   */
  private AddTransmissionField(identityResolver: IdentityResolver, auditLog: AuditLog, result: TransmissionResult) {
    const field = new Field<VerifiedTransmissionResult, Model>(
      this,
      new VerifiedTransmissionResult(identityResolver, auditLog.data, auditLog.seed, result)
    );
    this.results.push(field);
    this.allFields.push(field);
    this.allVerifiedFields.push(field);
  }
}
