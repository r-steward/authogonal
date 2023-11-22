import { UserCredentials } from "../user/user-authenticator";
import * as AuthActions from "./flux-actions";
type SilentLoginActions<U> = AuthActions.RequestedSilentLoginAction | AuthActions.SilentLoginSuccessAction<U> | AuthActions.SilentLoginFailureAction;
type ManualLoginActions<U> = AuthActions.RequestedManualLoginAction | AuthActions.ManualLoginSuccessAction<U> | AuthActions.ManualLoginFailureAction;
export type SilentLoginCallback<U> = (event: SilentLoginActions<U>) => void;
export type ManualLoginCallback<U> = (event: ManualLoginActions<U>) => void;
/**
 * The access manager is in charge of ensuring users have access to the API by either:
 * 1) silently logging them in on start up using some persistent access method
 * 2) logging them in manually
 * 3) keeping access up to date until the only option is a manual login
 *
 * The methods accept event callbacks so they can support any type of side effect management
 * e.g.
 * * callback can be a standard dispatcher
 * * methods can be wrapped in an observable which calls next on each callback
 */
export interface AccessManager<U> {
    /**
     * Perform login without user interaction (e.g. using tokens)
     * @param eventCallback handle events produced during action
     */
    silentLogin(eventCallback: SilentLoginCallback<U>): Promise<boolean>;
    /**
     * Perform a manual login using credentials
     * @param credentials login credentials
     * @param eventCallback handle events produced during action
     */
    manualLogin(credentials: UserCredentials, eventCallback: ManualLoginCallback<U>): Promise<boolean>;
    /**
     * If an API call is unauthorized, can try to reauthenticate
     * @param eventCallback handle events produced during action
     */
    onUnauthorized(eventCallback: AuthActions.EventCallback<U>): Promise<boolean>;
}
export {};
