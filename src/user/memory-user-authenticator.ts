import { isEqual } from 'lodash';
import { LifecycleTokens } from '../token';
import {
  AuthenticatorResponse,
  LOGIN,
  LoginCredentials,
  UserAuthenticator,
  UserCredentials,
  createErrorResponse,
  createSuccessResponse
} from './user-authenticator';

/**
 * Simple in memory authenticator to authenticate login and password attempts
 * For UI demo usage
 */
export class InMemoryUserAuthenticator<U> implements UserAuthenticator<U> {
  private _userMap: Map<string, { credential: LoginCredentials; user: U }>;
  private _delay: number;
  private _errorMessage: string;

  constructor(
    userMap: Map<string, { credential: LoginCredentials; user: U }>,
    errorMessage: string,
    delay: number = 0,
  ) {
    this._userMap = userMap;
    this._errorMessage = errorMessage;
    this._delay = delay;
  }

  authenticate(userCredentials: UserCredentials): Promise<AuthenticatorResponse<U>> {
    if (userCredentials.credentialType === LOGIN) {
      const credential = userCredentials.credentials;
      const entry = this._userMap.get(credential.userId);
      if (entry != null && isEqual(entry.credential, credential.password)) {
        const tokens: LifecycleTokens = null;
        return new Promise<AuthenticatorResponse<U>>(resolve => {
          setTimeout(() => {
            resolve(createSuccessResponse(entry.user, tokens));
          }, this._delay);
        });
      } else {
        return Promise.resolve(createErrorResponse(this._errorMessage));
      }
    }
  }

}
