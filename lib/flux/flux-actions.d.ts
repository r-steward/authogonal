import { UserCredentials } from '../user/user-authenticator';
export type EventCallback<U> = (action: AuthenticationAction<U>) => void;
export declare const PERFORM_MANUAL_LOGIN = "auth/perform-manual-login";
export interface PerformManualLoginAction {
    type: typeof PERFORM_MANUAL_LOGIN;
    credentials: UserCredentials;
}
export declare const REQUESTED_MANUAL_LOGIN = "auth/requested-manual-login";
export interface RequestedManualLoginAction {
    type: typeof REQUESTED_MANUAL_LOGIN;
    credentials: UserCredentials;
}
export declare const MANUAL_LOGIN_SUCCESS = "auth/manual-login-sucess";
export interface ManualLoginSuccessAction<U> {
    type: typeof MANUAL_LOGIN_SUCCESS;
    authenticatedUser: U;
}
export declare const MANUAL_LOGIN_FAILURE = "auth/manual-login-failure";
export interface ManualLoginFailureAction {
    type: typeof MANUAL_LOGIN_FAILURE;
    failureReason: string;
}
export declare const performManualLogin: (credentials: UserCredentials) => PerformManualLoginAction;
export declare const requestedManualLogin: (credentials: UserCredentials) => RequestedManualLoginAction;
export declare const manualLoginSuccess: <U>(authenticatedUser: U) => ManualLoginSuccessAction<U>;
export declare const manualLoginFailure: (failureReason: string) => ManualLoginFailureAction;
export declare const PERFORM_SILENT_LOGIN = "auth/perform-silent-login";
export interface PerformSilentLoginAction {
    type: typeof PERFORM_SILENT_LOGIN;
}
export declare const REQUESTED_SILENT_LOGIN = "auth/requested-silent-login";
export interface RequestedSilentLoginAction {
    type: typeof REQUESTED_SILENT_LOGIN;
    credentials: UserCredentials;
}
export declare const SILENT_LOGIN_SUCCESS = "auth/silent-login-sucess";
export interface SilentLoginSuccessAction<U> {
    type: typeof SILENT_LOGIN_SUCCESS;
    authenticatedUser: U;
}
export declare const SILENT_LOGIN_FAILURE = "auth/silent-login-failure";
export interface SilentLoginFailureAction {
    type: typeof SILENT_LOGIN_FAILURE;
    failureReason: string;
}
export declare const performSilentLogin: () => PerformSilentLoginAction;
export declare const requestedSilentLogin: (credentials: UserCredentials) => RequestedSilentLoginAction;
export declare const silentLoginSuccess: <U>(authenticatedUser: U) => SilentLoginSuccessAction<U>;
export declare const silentLoginFailure: (failureReason: string) => SilentLoginFailureAction;
export declare const PERFORM_LOGOUT = "auth/perform-logout";
export interface PerformLogoutAction {
    type: typeof PERFORM_LOGOUT;
}
export declare const REQUESTED_LOGOUT = "auth/requested-logout";
export interface RequestLogoutAction {
    type: typeof REQUESTED_LOGOUT;
}
export declare const LOGGED_OUT = "auth/logout-success";
export interface LoggedOutAction {
    type: typeof LOGGED_OUT;
}
export type AuthenticationAction<U> = PerformManualLoginAction | RequestedManualLoginAction | ManualLoginSuccessAction<U> | ManualLoginFailureAction | PerformSilentLoginAction | RequestedSilentLoginAction | SilentLoginSuccessAction<U> | SilentLoginFailureAction | PerformLogoutAction | RequestLogoutAction | LoggedOutAction;
