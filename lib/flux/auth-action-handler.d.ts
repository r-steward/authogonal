import { AuthenticationState } from '../user-authentication';
import { AuthenticationAction } from './flux-actions';
export declare function handleAuthAction<U>(state: AuthenticationState<U>, action: AuthenticationAction<U>): AuthenticationState<U>;
