import { Log } from '@core/log';
import { PublicKeyStore } from '@core/crypto';
import { AxiosRequestConfig } from 'axios';
import { VHostApp } from '@core/express/express-apps';
import { GetIdentityResponseBuilder } from '@core/model';
import { participantEndpoints } from '@core/endpoints';
import cors from 'cors';
import { corsOptionsAcceptAll } from '@core/express/utils';
import { IdentityConfig } from '@core/express/config';
import { ClientNodeError } from '@core/errors';
import { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from 'express';

export interface INode {
  app: VHostApp;
}

/**
 * A OneKey ExpressJS participant
 */
export class Node implements INode {
  public app: VHostApp;
  protected logger: Log;
  protected keyStore: PublicKeyStore;

  constructor(hostName: string, identity: IdentityConfig, s2sOptions?: AxiosRequestConfig) {
    this.logger = new Log(`${identity.type}[${identity.name}]`, '#bbb');
    this.app = new VHostApp(identity.name, hostName);
    this.keyStore = new PublicKeyStore(s2sOptions);

    // All nodes must implement the identity endpoint
    const { name, type, publicKeys, dpoEmailAddress, privacyPolicyUrl } = identity;
    const response = new GetIdentityResponseBuilder(name, type, dpoEmailAddress, privacyPolicyUrl).buildResponse(
      publicKeys
    );

    this.app.expressApp.get(
      participantEndpoints.identity,
      cors(corsOptionsAcceptAll),
      this.startSpan(participantEndpoints.identity),
      (req: Request, res: Response, next: NextFunction) => {
        res.json(response);
        next();
      },
      this.handleErrors(participantEndpoints.identity),
      this.endSpan(participantEndpoints.identity)
    );
  }

  /**
   * Returns a handler that starts a span
   * @param endPointName
   * @protected
   */
  protected startSpan(endPointName: string): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      this.logger.Info(endPointName);
      next();
    };
  }

  /**
   * Returns a header that ends a span
   * @param endPointName
   * @protected
   */
  protected endSpan(endPointName: string): RequestHandler {
    return () => {
      this.logger.Info(`${endPointName} - END`);
    };
  }

  /**
   * Returns a handler that handles errors
   * @param endPointName
   * @protected
   */
  protected handleErrors(endPointName: string): ErrorRequestHandler {
    return (err: ClientNodeError, req: Request, res: Response, next: NextFunction) => {
      // TODO next step: define a common logging format for errors (on 1 line), usable for monitoring
      this.logger.Error(endPointName, err);
    };
  }
}
