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

    this.app.expressApp.get(participantEndpoints.identity, cors(corsOptionsAcceptAll), (req, res) => {
      res.json(response);
    });
  }

  protected startSpan(endPointName: string): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      this.logger.Info(endPointName);
      next();
    };
  }

  protected endSpan(endPointName: string): RequestHandler {
    return () => {
      this.logger.Info(`${endPointName} - END`);
    };
  }

  protected handleErrors(endPointName: string): ErrorRequestHandler {
    return (err: ClientNodeError, req: Request, res: Response, next: NextFunction) => {
      if (err) {
        this.logger.Error(endPointName, err);
      }
    };
  }
}
