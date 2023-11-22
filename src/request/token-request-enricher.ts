import { LogFactory } from 'logging-facade';

import { RequestEnricher } from './request-enricher';
import { TokenProvider } from '../token/token-manager';

const LOGGER = LogFactory.getLogger('request-token-authenticator');

interface RequestLike {
  set(field: string, val: string): this;
}

/**
 * Bespoke request enricher that adds an authorization token to the request header 
 */
export class TokenRequestEnricher<R extends RequestLike> implements RequestEnricher<R> {
  private _tokenProvider: TokenProvider;

  constructor(tokenProvider: TokenProvider) {
    this._tokenProvider = tokenProvider;
  }

  public async authorizeRequest(request: R): Promise<R> {
    if (LOGGER.isDebugEnabled) {
      LOGGER.debug('Authorizing request');
    }
    const tokenResponse = await this._tokenProvider.authorizationToken();
    if (tokenResponse == null) {
      return request;
    }
    return setAuthorizationHeader(request, tokenResponse);
  }
}

export function setAuthorizationHeader<R extends RequestLike>(request: R, value: string) {
  return request.set('Authorization', value);
}