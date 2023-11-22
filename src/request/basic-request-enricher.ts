import { LogFactory } from 'logging-facade';

import { RequestEnricher } from './request-enricher';

const LOGGER = LogFactory.getLogger('basic-request-authenticator');

/**
 * Request that excepts auth values
 */
interface RequestLike {
  auth(user: string, pwd: string, options: { type: string }): this;
}

/**
 * Basic request authenticator
 * Updates a request with basic auth info from user authentication object
 */
export class BasicRequestEnricher<R extends RequestLike> implements RequestEnricher<R> {
  private readonly _userId: string;
  private readonly _password: string;

  constructor(userId: string, password: string) {
    this._userId = userId;
    this._password = password;
  }

  public authorizeRequest(request: R): Promise<R> {
    if (LOGGER.isDebugEnabled) {
      LOGGER.debug('Authorizing request');
    }
    return Promise.resolve(
      request.auth(this._userId, this._password, {
        type: 'basic',
      }),
    );
  }
}
