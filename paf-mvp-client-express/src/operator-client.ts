import {
  GetIdsPrefsResponse,
  Identifiers,
  IdsAndPreferences,
  PostSignPreferencesRequest,
  PostVerifySeedRequest,
  PostVerifyTransmissionResultRequest,
  Preferences,
  ProxyPostIdsPrefsResponse,
  Seed,
  Signature,
  TransactionId,
} from '@onekey/core/model/generated-model';
import { CurrentModelVersion, UnsignedSource } from '@onekey/core/model/model';
import { PublicKeyProvider } from '@onekey/core/crypto/key-store';
import {
  DeleteIdsPrefsRequestBuilder,
  Get3PCRequestBuilder,
  GetIdsPrefsRequestBuilder,
  GetNewIdRequestBuilder,
  PostIdsPrefsRequestBuilder,
} from '@onekey/core/model/operator-request-builders';
import { Signer } from '@onekey/core/crypto/signer';
import { MessageVerificationResult, ResponseVerifier, Verifier } from '@onekey/core/crypto/verifier';
import { getTimeStampInSec } from '@onekey/core/timestamp';
import { Request } from 'express';
import { getPayload } from '@onekey/core/express';
import { proxyUriParams } from '@onekey/core/endpoints';
import {
  SeedSigningDefinition,
  UnsignedSeedSignatureData,
} from '@onekey/core/signing-definition/seed-signing-definition';
import {
  IdsAndPrefsSigningDefinition,
  IdsAndUnsignedPreferences,
} from '@onekey/core/signing-definition/ids-prefs-signing-definition';
import { ResponseSigningDefinition } from '@onekey/core/signing-definition/response-signing-definition';
import { TransmissionResultSigningDefinition } from '@onekey/core/signing-definition/transmission-result-signing-definition';

// FIXME should probably be moved to core library
export class OperatorClient {
  private readonly getIdsPrefsRequestBuilder: GetIdsPrefsRequestBuilder;
  private readonly deleteIdsPrefsRequestBuilder: DeleteIdsPrefsRequestBuilder;
  private readonly prefsSigner: Signer<IdsAndUnsignedPreferences>;
  private readonly seedSigner: Signer<UnsignedSeedSignatureData>;
  private readonly postIdsPrefsRequestBuilder: PostIdsPrefsRequestBuilder;
  private readonly get3PCRequestBuilder: Get3PCRequestBuilder;
  private readonly getNewIdRequestBuilder: GetNewIdRequestBuilder;

  constructor(
    protected operatorHost: string,
    private clientHost: string,
    privateKey: string,
    private readonly publicKeyProvider: PublicKeyProvider,
    private readonly readVerifier = new ResponseVerifier(publicKeyProvider, new ResponseSigningDefinition()),
    private readonly seedVerifier = new Verifier(publicKeyProvider, new SeedSigningDefinition()),
    private readonly transmissionResultVerifier = new Verifier(
      publicKeyProvider,
      new TransmissionResultSigningDefinition()
    )
  ) {
    this.getIdsPrefsRequestBuilder = new GetIdsPrefsRequestBuilder(operatorHost, clientHost, privateKey);
    this.deleteIdsPrefsRequestBuilder = new DeleteIdsPrefsRequestBuilder(operatorHost, clientHost, privateKey);
    this.prefsSigner = new Signer(privateKey, new IdsAndPrefsSigningDefinition());
    this.seedSigner = new Signer(privateKey, new SeedSigningDefinition());
    this.postIdsPrefsRequestBuilder = new PostIdsPrefsRequestBuilder(operatorHost, clientHost, privateKey);
    this.get3PCRequestBuilder = new Get3PCRequestBuilder(operatorHost);
    this.getNewIdRequestBuilder = new GetNewIdRequestBuilder(operatorHost, clientHost, privateKey);
  }

  async verifyReadResponse(request: GetIdsPrefsResponse): Promise<MessageVerificationResult> {
    // Signature + timestamp + sender + receiver are valid
    return this.readVerifier.verifySignatureAndContent(request, this.operatorHost, this.clientHost);
  }

  async verifySeed(seedToVerify: PostVerifySeedRequest): Promise<MessageVerificationResult> {
    return this.seedVerifier.verifySignature(seedToVerify);
  }

  async verifyTransmissionResult(
    transmissionDataToVerify: PostVerifyTransmissionResultRequest
  ): Promise<MessageVerificationResult> {
    return this.transmissionResultVerifier.verifySignature(transmissionDataToVerify);
  }

  async buildPreferences(
    identifiers: Identifiers,
    data: { use_browsing_for_personalization: boolean },
    timestamp = getTimeStampInSec()
  ): Promise<Preferences> {
    const unsignedPreferences: UnsignedSource<Preferences> = {
      version: '0.1',
      data,
      source: {
        domain: this.clientHost,
        timestamp,
      },
    };

    const { source, ...rest } = unsignedPreferences;

    return {
      ...rest,
      source: {
        ...source,
        signature: await this.prefsSigner.sign({ identifiers, preferences: unsignedPreferences }),
      },
    };
  }

  async buildSeed(transactionIds: TransactionId[], idsAndPreferences: IdsAndPreferences): Promise<Seed> {
    const unsigned = this.createUnsignedSeed(transactionIds);
    const signature = await this.seedSigner.sign({ seed: unsigned, idsAndPreferences });
    return this.addSignatureToSeed(unsigned, signature);
  }

  /**
   * Build a request to READ ids and preferences from the operator
   * @param req
   */
  async getReadRequest(req: Request): Promise<string> {
    const getIdsPrefsRequestJson = await this.getIdsPrefsRequestBuilder.buildRestRequest({
      origin: req.header('origin'),
    });
    return this.getIdsPrefsRequestBuilder.getRestUrl(getIdsPrefsRequestJson).toString();
  }

  async getWriteResponse(req: Request): Promise<ProxyPostIdsPrefsResponse> {
    const unsignedRequest = getPayload<IdsAndPreferences>(req);
    const signedPayload = await this.postIdsPrefsRequestBuilder.buildRestRequest(
      { origin: req.header('origin') },
      unsignedRequest
    );

    const url = this.postIdsPrefsRequestBuilder.getRestUrl();
    // Return both the signed payload and the url to call
    return {
      payload: signedPayload,
      url: url.toString(),
    };
  }

  async getWriteRedirectResponse(req: Request): Promise<string> {
    // return URL has already been verified by previous handler
    const returnUrl = this.getReturnUrl(req);

    // TODO errors trigger error if req.query[proxyUriParams.message] undefined or empty
    const input = JSON.parse(req.query[proxyUriParams.message] as string) as IdsAndPreferences;

    const postIdsPrefsRequestJson = await this.postIdsPrefsRequestBuilder.buildRedirectRequest(
      {
        returnUrl: returnUrl.toString(),
        referer: req.header('referer'),
      },
      input
    );

    return this.postIdsPrefsRequestBuilder.getRedirectUrl(postIdsPrefsRequestJson).toString();
  }

  getVerify3PCResponse(): string {
    return this.get3PCRequestBuilder.getRestUrl().toString();
  }

  async getReadRedirectResponse(req: Request): Promise<string> {
    const returnUrl = this.getReturnUrl(req);
    const getIdsPrefsRequestJson = await this.getIdsPrefsRequestBuilder.buildRedirectRequest({
      referer: req.header('referer'),
      returnUrl: returnUrl.toString(),
    });
    return this.getIdsPrefsRequestBuilder.getRedirectUrl(getIdsPrefsRequestJson).toString();
  }

  async getDeleteRedirectResponse(req: Request): Promise<string> {
    const returnUrl = this.getReturnUrl(req);
    const deleteIdsPrefsRequestJson = await this.deleteIdsPrefsRequestBuilder.buildRedirectRequest({
      referer: req.header('referer'),
      returnUrl: returnUrl.toString(),
    });
    return this.deleteIdsPrefsRequestBuilder.getRedirectUrl(deleteIdsPrefsRequestJson).toString();
  }

  async getNewIdResponse(req: Request): Promise<string> {
    const getNewIdRequestJson = await this.getNewIdRequestBuilder.buildRestRequest({ origin: req.header('origin') });
    return this.getNewIdRequestBuilder.getRestUrl(getNewIdRequestJson).toString();
  }

  async getDeleteResponse(req: Request): Promise<string> {
    const request = await this.deleteIdsPrefsRequestBuilder.buildRestRequest({ origin: req.header('origin') });
    return this.deleteIdsPrefsRequestBuilder.getRestUrl(request).toString();
  }

  async getSignPreferencesResponse(req: Request): Promise<Preferences> {
    const { identifiers, unsignedPreferences } = getPayload<PostSignPreferencesRequest>(req);
    return this.buildPreferences(identifiers, unsignedPreferences.data);
  }

  private getReturnUrl(req: Request) {
    return req.query[proxyUriParams.returnUrl] as string;
  }

  private createUnsignedSeed(transactionIds: TransactionId[], timestamp = getTimeStampInSec()): UnsignedSource<Seed> {
    return {
      version: CurrentModelVersion,
      transaction_ids: transactionIds,
      publisher: this.clientHost,
      source: {
        domain: this.clientHost,
        timestamp,
      },
    };
  }

  private addSignatureToSeed(unsigned: UnsignedSource<Seed>, signature: Signature): Seed {
    return {
      ...unsigned,
      source: {
        ...unsigned.source,
        signature,
      },
    };
  }
}
