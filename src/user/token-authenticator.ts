import { LogFactory } from 'logging-facade';
import { AuthenticatorResponse, LogoutInfo, SUCCESS, TOKEN, UserAuthenticator, UserCredentials } from './user-authenticator';
import { AuthUserService, TokenLoginService } from '../api/auth-service';
import { AccessTokenResponse, TokenAndType, TokenType } from '../token/token-manager';

const LOGGER = LogFactory.getLogger('api-user-authenticator');

export class TokenAuthenticator<U> implements UserAuthenticator<U> {

  constructor(
    private _userService: AuthUserService<U>,
    private _loginService: TokenLoginService
  ) {
  }

  async authenticate(userCredentials: UserCredentials): Promise<AuthenticatorResponse<U>> {
    if (userCredentials.credentialType === TOKEN) {
      // log in to start a user token session, and save the tokens
      const credential = userCredentials.credentials;
      let tokens: AccessTokenResponse = null;
      switch (credential.type) {
        case TokenType.RefreshToken:
          tokens = await this._loginService.loginWithRefreshToken(credential.token);
          break;
        case TokenType.RememberMeToken:
          tokens = await this._loginService.loginWithRememberMeToken(credential.token);
      }
      const user = await this._userService.getUserDetails(tokens.accessToken);
      return {
        type: SUCCESS,
        user,
        tokens
      };
    }
    else {
      LOGGER.warn(`Incorrect credential type ${userCredentials.credentialType} received`);
      return Promise.resolve(null);
    }
  }
}
