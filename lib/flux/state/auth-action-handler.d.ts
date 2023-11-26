import { AuthenticationState } from './authentication-state';
import * as AuthActions from '../flux-actions';
export declare const baseState: AuthenticationState<any>;
export type StateHandler<U> = (state: AuthenticationState<U>, action: AuthActions.AuthenticationAction<U>) => AuthenticationState<U>;
export declare function handleAuthAction<U>(state: AuthenticationState<U>, action: AuthActions.AuthenticationAction<U>): AuthenticationState<U>;
