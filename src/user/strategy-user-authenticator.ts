import {
  AuthenticatorResponse,
  LogoutInfo,
  UserAuthenticator,
  UserCredentials,
  UserCredentialsType,
} from './user-authenticator';

/**
 * Strategy decorator to handle multiple types of user authentication
 */
export class StrategyUserAuthenticator<U> implements UserAuthenticator<U> {
  private readonly strategyMap: Map<UserCredentialsType, UserAuthenticator<U>>;

  constructor(strategyMap: Map<UserCredentialsType, UserAuthenticator<U>>) {
    this.strategyMap = strategyMap;
  }

  public async authenticate(userCredentials: UserCredentials): Promise<AuthenticatorResponse<U>> {
    const service = this.strategyMap.get(userCredentials.credentialType);
    if (service != null) {
      return await service.authenticate(userCredentials);
    } else {
      throw {
        userCredentials,
        loginMessage: 'No service',
      };
    }
  }
}
