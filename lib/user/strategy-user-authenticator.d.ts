import { AuthenticatorResponse, UserAuthenticator, UserCredentials, UserCredentialsType } from './user-authenticator';
/**
 * Strategy decorator to handle multiple types of user authentication
 */
export declare class StrategyUserAuthenticator<U> implements UserAuthenticator<U> {
    private readonly strategyMap;
    constructor(strategyMap: Map<UserCredentialsType, UserAuthenticator<U>>);
    authenticate(userCredentials: UserCredentials): Promise<AuthenticatorResponse<U>>;
}
