import { LogFactory } from 'logging-facade';
import { TokenManager, TokenProvider, TokenType } from './token-manager';

const LOGGER = LogFactory.getLogger('DefaultTokenProvider');
/**
 * Token provider that uses the token manager to provide the access token
 */
export class DefaultTokenProvider<U> implements TokenProvider {
  constructor(private readonly tokenManager: TokenManager) {}

  async authorizationToken(): Promise<string> {
    const accessToken = await this.tokenManager.getToken(TokenType.AccessToken);
    if (accessToken.isExpired) {
      LOGGER.warn('Access token is expired');
    }
    return accessToken.token;
  }
}
