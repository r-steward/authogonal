import { UserAuthenticator } from '../user-authenticator';
import { UserCredentials } from '../user-authentication';
export declare class InMemoryUserAuthenticator<U> implements UserAuthenticator<U> {
    private _userMap;
    private _delay;
    private _errorMessage;
    constructor(userMap: Map<string, {
        credential: any;
        user: U;
    }>, errorMessage: string, delay?: number);
    authenticate(userCredentials: UserCredentials): Promise<U>;
    logout(): Promise<void>;
}
