import { SubscribableDispatcher, AbstractDispatcherStore } from 'fourspace-flux-ts';
import { AuthenticationState } from '../user-authentication';
import { AuthenticationStore } from './auth-store';
import { AuthenticationAction } from './flux-actions';
export declare class AuthenticationStoreImpl<U> extends AbstractDispatcherStore<AuthenticationAction<U>, AuthenticationState<U>> implements AuthenticationStore<U> {
    private _userAuthentication;
    constructor(dispatcher: SubscribableDispatcher<AuthenticationAction<U>>, baseState?: AuthenticationState<U>);
    getState(): AuthenticationState<U>;
    generateChange(action: AuthenticationAction<U>): boolean;
    doHandle(payload: AuthenticationAction<U>): boolean;
}
