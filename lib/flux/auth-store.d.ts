import { AuthenticationState } from './../user-authentication';
import { FluxStore } from 'fourspace-flux-ts';
export interface AuthenticationStore<U> extends FluxStore<AuthenticationState<U>> {
}
