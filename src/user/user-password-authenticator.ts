import { LogFactory } from 'logging-facade';
import { AuthenticatorResponse, LOGIN, SUCCESS, UserAuthenticator, UserCredentials } from './user-authenticator';
import { AuthUserService, PasswordLoginService } from '../api/auth-service';

const LOGGER = LogFactory.getLogger('user-password-authenticator');

export class UserPasswordAuthenticator<U> implements UserAuthenticator<U> {
  constructor(private _userService: AuthUserService<U>, private _loginService: PasswordLoginService) {}

  async authenticate(userCredentials: UserCredentials): Promise<AuthenticatorResponse<U>> {
    if (userCredentials.credentialType === LOGIN) {
      // log in to start a user token session, and save the tokens
      const credential = userCredentials.credentials;
      const tokens = await this._loginService.loginWithUserId(
        credential.userId,
        credential.password,
        credential.remember,
      );
      const user = await this._userService.getUserDetails(tokens.accessToken);
      return {
        type: SUCCESS,
        user,
        tokens,
      };
    } else {
      LOGGER.warn(`Incorrect credential type ${userCredentials.credentialType} received`);
      return Promise.resolve(null);
    }
  }
}
