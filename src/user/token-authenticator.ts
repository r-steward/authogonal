import { LogFactory } from 'logging-facade';
import { AuthUserService, TokenLoginService } from '../api/auth-service';
import { LifecycleTokens, TokenAndType, TokenType } from '../token/token-manager';
import {
  AuthenticatorResponse,
  TOKEN,
  UserAuthenticator,
  UserCredentials,
  createErrorResponse,
  createSuccessResponse,
  resolveErrorOnIncorrectType
} from './user-authenticator';
import { isError } from '../util';

const LOGGER = LogFactory.getLogger('TokenAuthenticator');

export class TokenAuthenticator<U> implements UserAuthenticator<U> {
  constructor(private _userService: AuthUserService<U>, private _loginService: TokenLoginService) { }

  async authenticate(userCredentials: UserCredentials): Promise<AuthenticatorResponse<U>> {
    if (userCredentials.credentialType === TOKEN) {
      return this.authenticateToken(userCredentials.credentials);
    } else {
      return resolveErrorOnIncorrectType(LOGGER, userCredentials.credentialType);
    }
  }

  private async authenticateToken(credential: TokenAndType): Promise<AuthenticatorResponse<U>> {
    let tokens: LifecycleTokens = null;
    let user: U = null;
    try {
      switch (credential.type) {
        case TokenType.RefreshToken:
          tokens = await this._loginService.loginWithRefreshToken(credential.token);
          break;
        case TokenType.RememberMeToken:
          tokens = await this._loginService.loginWithRememberMeToken(credential.token);
          break;
        default:
          throw new Error(`Unhandled token type ${credential.type}`);
      }
      user = await this._userService.getUserDetails(tokens.accessToken);
    } catch (e) {
      LOGGER.debug(`Token authentication failed for token type <${credential.type}> with [${e}]`);
      const reason = isError(e) ? e.message : 'Failed to login with token';
      return createErrorResponse(reason);
    }

    if (LOGGER.isDebugEnabled()) {
      LOGGER.debug(`Successful login with token type <${credential.type}>`);
    }
    return createSuccessResponse(user, tokens);
  }

}
