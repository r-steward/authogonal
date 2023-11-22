import { AuthenticationState } from './authentication-state';
import * as AuthActions from '../flux-actions';
export declare function handleAuthAction<U>(state: AuthenticationState<U>, action: AuthActions.AuthenticationAction<U>): AuthenticationState<U>;
