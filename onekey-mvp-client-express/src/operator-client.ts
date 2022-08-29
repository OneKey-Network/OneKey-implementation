import {
  GetIdsPrefsResponse,
  Identifiers,
  IdsAndPreferences,
  PostSignPreferencesRequest,
  Preferences,
  ProxyPostIdsPrefsResponse,
  Seed,
  Signature,
  TransactionId,
} from '@core/model/generated-model';
import { CurrentModelVersion, UnsignedSource } from '@core/model/model';
import { privateKeyFromString } from '@core/crypto/keys';
import { PublicKeyProvider } from '@core/crypto/key-store';
import {
  DeleteIdsPrefsRequestBuilder,
  Get3PCRequestBuilder,
  GetIdsPrefsRequestBuilder,
  GetNewIdRequestBuilder,
  PostIdsPrefsRequestBuilder,
} from '@core/model/operator-request-builders';
import { Signer } from '@core/crypto/signer';
import {
  IdsAndPreferencesDefinition,
  IdsAndUnsignedPreferences,
  ResponseDefinition,
  SeedSignatureBuilder,
  SeedSignatureContainer,
} from '@core/crypto/signing-definition';
import { MessageVerificationResult, ResponseVerifier } from '@core/crypto/verifier';
import { getTimeStampInSec } from '@core/timestamp';
import { Request } from 'express';
import { getPayload } from '@core/express';
import { proxyUriParams } from '@core/endpoints';

// FIXME should probably be moved to core library
export class OperatorClient {
  private readonly getIdsPrefsRequestBuilder: GetIdsPrefsRequestBuilder;
  private readonly deleteIdsPrefsRequestBuilder: DeleteIdsPrefsRequestBuilder;
  private readonly prefsSigner: Signer<IdsAndUnsignedPreferences>;
  private readonly seedSigner: Signer<SeedSignatureContainer>;
  private readonly postIdsPrefsRequestBuilder: PostIdsPrefsRequestBuilder;
  private readonly get3PCRequestBuilder: Get3PCRequestBuilder;
  private readonly getNewIdRequestBuilder: GetNewIdRequestBuilder;

  constructor(
    protected operatorHost: string,
    private clientHost: string,
    privateKey: string,
    private readonly publicKeyProvider: PublicKeyProvider,
    private readonly readVerifier = new ResponseVerifier(publicKeyProvider, new ResponseDefinition())
  ) {
    this.getIdsPrefsRequestBuilder = new GetIdsPrefsRequestBuilder(operatorHost, clientHost, privateKey);
    this.deleteIdsPrefsRequestBuilder = new DeleteIdsPrefsRequestBuilder(operatorHost, clientHost, privateKey);
    this.prefsSigner = new Signer(privateKeyFromString(privateKey), new IdsAndPreferencesDefinition());
    this.seedSigner = new Signer(privateKeyFromString(privateKey), new SeedSignatureBuilder());
    this.postIdsPrefsRequestBuilder = new PostIdsPrefsRequestBuilder(operatorHost, clientHost, privateKey);
    this.get3PCRequestBuilder = new Get3PCRequestBuilder(operatorHost);
    this.getNewIdRequestBuilder = new GetNewIdRequestBuilder(operatorHost, clientHost, privateKey);
  }

  async verifyReadResponse(request: GetIdsPrefsResponse): Promise<MessageVerificationResult> {
    // Signature + timestamp + sender + receiver are valid
    return this.readVerifier.verifySignatureAndContent(request, this.operatorHost, this.clientHost);
  }

  buildPreferences(
    identifiers: Identifiers,
    data: { use_browsing_for_personalization: boolean },
    timestamp = getTimeStampInSec()
  ): Preferences {
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
        signature: this.prefsSigner.sign({ identifiers, preferences: unsignedPreferences }),
      },
    };
  }

  buildSeed(transactionIds: TransactionId[], idsAndPreferences: IdsAndPreferences): Seed {
    const unsigned = this.createUnsignedSeed(transactionIds);
    const signature = this.seedSigner.sign({ seed: unsigned, idsAndPreferences });
    return this.addSignatureToSeed(unsigned, signature);
  }

  getReadResponse(req: Request): string {
    const getIdsPrefsRequestJson = this.getIdsPrefsRequestBuilder.buildRestRequest({ origin: req.header('origin') });
    return this.getIdsPrefsRequestBuilder.getRestUrl(getIdsPrefsRequestJson).toString();
  }

  getWriteResponse(req: Request): ProxyPostIdsPrefsResponse {
    const unsignedRequest = getPayload<IdsAndPreferences>(req);
    const signedPayload = this.postIdsPrefsRequestBuilder.buildRestRequest(
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

  getWriteRedirectResponse(req: Request): string {
    // return URL has already been verified by previous handler
    const returnUrl = this.getReturnUrl(req);

    // TODO errors trigger error if req.query[proxyUriParams.message] undefined or empty
    const input = JSON.parse(req.query[proxyUriParams.message] as string) as IdsAndPreferences;

    const postIdsPrefsRequestJson = this.postIdsPrefsRequestBuilder.buildRedirectRequest(
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

  getReadRedirectResponse(req: Request): string {
    const returnUrl = this.getReturnUrl(req);
    const getIdsPrefsRequestJson = this.getIdsPrefsRequestBuilder.buildRedirectRequest({
      referer: req.header('referer'),
      returnUrl: returnUrl.toString(),
    });
    return this.getIdsPrefsRequestBuilder.getRedirectUrl(getIdsPrefsRequestJson).toString();
  }

  getDeleteRedirectResponse(req: Request): string {
    const returnUrl = this.getReturnUrl(req);
    const deleteIdsPrefsRequestJson = this.deleteIdsPrefsRequestBuilder.buildRedirectRequest({
      referer: req.header('referer'),
      returnUrl: returnUrl.toString(),
    });
    return this.deleteIdsPrefsRequestBuilder.getRedirectUrl(deleteIdsPrefsRequestJson).toString();
  }

  getNewIdResponse(req: Request) {
    const getNewIdRequestJson = this.getNewIdRequestBuilder.buildRestRequest({ origin: req.header('origin') });
    return this.getNewIdRequestBuilder.getRestUrl(getNewIdRequestJson).toString();
  }

  getDeleteResponse(req: Request) {
    const request = this.deleteIdsPrefsRequestBuilder.buildRestRequest({ origin: req.header('origin') });
    return this.deleteIdsPrefsRequestBuilder.getRestUrl(request).toString();
  }

  getSignPreferencesResponse(req: Request): Preferences {
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
