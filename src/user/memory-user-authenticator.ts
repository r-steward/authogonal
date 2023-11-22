import { AuthenticatorResponse, LOGIN, LoginCredentials, SUCCESS, UserAuthenticator, UserCredentials, UserCredentialsDefinition } from './user-authenticator';
import { isEqual } from 'lodash';

/**
 * Simple in memory authenticator to authenticate login and password attempts
 * For UI demo usage
 */
export class InMemoryUserAuthenticator<U> implements UserAuthenticator<U> {
  private _userMap: Map<string, { credential: LoginCredentials; user: U }>;
  private _delay: number;
  private _errorMessage: string;

  constructor(userMap: Map<string, { credential: LoginCredentials; user: U }>, errorMessage: string, delay: number = 0) {
    this._userMap = userMap;
    this._errorMessage = errorMessage;
    this._delay = delay;
  }
  authenticate(userCredentials: UserCredentials): Promise<AuthenticatorResponse<U>> {
    if (userCredentials.credentialType === LOGIN) {
      const credential = userCredentials.credentials;
      const entry = this._userMap.get(credential.userId);
      if (entry != null && isEqual(entry.credential, credential.password)) {
        return new Promise<AuthenticatorResponse<U>>(resolve => {
          setTimeout(() => {
            resolve({ user: entry.user, tokens: null, type: SUCCESS });
          }, this._delay);
        });
      } else {
        return Promise.reject({
          userCredentials,
          loginMessage: this._errorMessage,
        });
      }
    }
  }

  public logout(): Promise<void> {
    // do nothing
    return Promise.resolve();
  }
}
