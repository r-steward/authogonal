import { AuthenticatorResponse, LoginCredentials, UserAuthenticator, UserCredentials } from './user-authenticator';
/**
 * Simple in memory authenticator to authenticate login and password attempts
 * For UI demo usage
 */
export declare class InMemoryUserAuthenticator<U> implements UserAuthenticator<U> {
    private _userMap;
    private _delay;
    private _errorMessage;
    constructor(userMap: Map<string, {
        credential: LoginCredentials;
        user: U;
    }>, errorMessage: string, delay?: number);
    authenticate(userCredentials: UserCredentials): Promise<AuthenticatorResponse<U>>;
    logout(): Promise<void>;
}
