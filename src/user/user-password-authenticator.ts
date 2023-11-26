import { LogFactory } from 'logging-facade';
import { AuthUserService, PasswordLoginService } from '../api/auth-service';
import { AuthenticatorResponse, LOGIN, LoginCredentials, UserAuthenticator, UserCredentials, createErrorResponse, createSuccessResponse, resolveErrorOnIncorrectType } from './user-authenticator';
import { isError } from '../util';

const LOGGER = LogFactory.getLogger('UserPasswordAuthenticator');

export class UserPasswordAuthenticator<U> implements UserAuthenticator<U> {

  constructor(private _userService: AuthUserService<U>, private _loginService: PasswordLoginService) { }

  async authenticate(userCredentials: UserCredentials): Promise<AuthenticatorResponse<U>> {
    if (userCredentials.credentialType === LOGIN) {
      return this.authenticateLogin(userCredentials.credentials);
    } else {
      return resolveErrorOnIncorrectType(LOGGER, userCredentials.credentialType);
    }
  }

  private async authenticateLogin(credential: LoginCredentials): Promise<AuthenticatorResponse<U>> {
    // log in to start a user token session, and save the tokens
    try {
      const tokens = await this._loginService.loginWithUserId(
        credential.userId,
        credential.password,
        credential.remember,
      );
      const user = await this._userService.getUserDetails(tokens.accessToken);
      return createSuccessResponse(user, tokens);
    } catch (e) {
      LOGGER.debug(`User/password authentication failed with ${e}`);
      const reason = isError(e) ? e.message : 'Failed to login with user/password';
      return createErrorResponse(reason);
    }
  }

}
