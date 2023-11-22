import { UserCredentials, LogoutInfo } from '../user-authentication';
import { UserAuthenticator } from '../user-authenticator';
import { AuthenticationActionCreator } from './auth-action-creator';
import { AuthenticationAction } from './flux-actions';
declare type Dispatcher<A> = (action: A) => void;
export declare class AuthenticationActionCreatorImpl<U> implements AuthenticationActionCreator {
    private readonly _authDispatcher;
    private readonly _userAuthenticator;
    constructor(authDispatcher: Dispatcher<AuthenticationAction<U>>, userAuthenticator: UserAuthenticator<U>);
    performLogin(userCredentials: UserCredentials): Promise<void>;
    performLogout(logoutInfo: LogoutInfo): Promise<void>;
    invalidateAuthorization(): Promise<void>;
}
export {};
