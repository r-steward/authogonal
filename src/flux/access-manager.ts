import { UserCredentials } from '../user/user-authenticator';
import * as AuthActions from './flux-actions';

export type SilentLoginActions<U> =
    | AuthActions.RequestedSilentLoginAction
    | AuthActions.SilentLoginSuccessAction<U>
    | AuthActions.SilentLoginFailureAction;
export type ManualLoginActions<U> =
    | AuthActions.RequestedManualLoginAction
    | AuthActions.ManualLoginSuccessAction<U>
    | AuthActions.ManualLoginFailureAction;
export type LogoutActions =
    | AuthActions.PerformLogoutAction
    | AuthActions.RequestLogoutAction
    | AuthActions.LoggedOutAction;
export type RefreshLoginCallback = (event: AuthActions.PerformRefreshLoginAction) => void;
export type SilentLoginCallback<U> = (event: SilentLoginActions<U>) => void;
export type ManualLoginCallback<U> = (event: ManualLoginActions<U>) => void;
export type LogoutCallback = (event: LogoutActions) => void;

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
     * Sets the callback for timed refresh token events
     * @param eventCallback 
     */
    setRefreshLoginEventCallback(eventCallback: RefreshLoginCallback): void;

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
     * Perform logout
     * @param eventCallback handle events produced during action
     */
    logout(eventCallback: LogoutCallback): Promise<void>;

    /**
     * If an API call is unauthorized, can try to reauthenticate
     * @param eventCallback handle events produced during action
     */
    onUnauthorized(eventCallback: SilentLoginCallback<U>): Promise<boolean>;

    /**
     * If tokens expire, can try to reauthenticate
     * @param eventCallback handle events produced during action
     */
    onAccessExpired(eventCallback: SilentLoginCallback<U>): Promise<boolean>;

}
