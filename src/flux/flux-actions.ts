import { UserCredentials } from '../user/user-authenticator';

export type EventCallback<U> = (action: AuthenticationAction<U>) => void;

// Manual Login
export const PERFORM_MANUAL_LOGIN = 'auth/perform-manual-login';
export interface PerformManualLoginAction {
  type: typeof PERFORM_MANUAL_LOGIN;
  credentials: UserCredentials;
}

export const REQUESTED_MANUAL_LOGIN = 'auth/requested-manual-login';
export interface RequestedManualLoginAction {
  type: typeof REQUESTED_MANUAL_LOGIN;
  credentials: UserCredentials;
}

export const MANUAL_LOGIN_SUCCESS = 'auth/manual-login-sucess';
export interface ManualLoginSuccessAction<U> {
  type: typeof MANUAL_LOGIN_SUCCESS;
  authenticatedUser: U;
}

export const MANUAL_LOGIN_FAILURE = 'auth/manual-login-failure';
export interface ManualLoginFailureAction {
  type: typeof MANUAL_LOGIN_FAILURE;
  failureReason: string;
}
export const performManualLogin = (credentials: UserCredentials): PerformManualLoginAction => ({
  type: PERFORM_MANUAL_LOGIN,
  credentials,
});
export const requestedManualLogin = (credentials: UserCredentials): RequestedManualLoginAction => ({
  type: REQUESTED_MANUAL_LOGIN,
  credentials,
});
export const manualLoginSuccess = <U>(authenticatedUser: U): ManualLoginSuccessAction<U> => ({
  type: MANUAL_LOGIN_SUCCESS,
  authenticatedUser,
});
export const manualLoginFailure = (failureReason: string): ManualLoginFailureAction => ({
  type: MANUAL_LOGIN_FAILURE,
  failureReason,
});

// Silent login
export const PERFORM_SILENT_LOGIN = 'auth/perform-silent-login';
export interface PerformSilentLoginAction {
  type: typeof PERFORM_SILENT_LOGIN;
}

export const REQUESTED_SILENT_LOGIN = 'auth/requested-silent-login';
export interface RequestedSilentLoginAction {
  type: typeof REQUESTED_SILENT_LOGIN;
  credentials: UserCredentials;
}

export const SILENT_LOGIN_SUCCESS = 'auth/silent-login-sucess';
export interface SilentLoginSuccessAction<U> {
  type: typeof SILENT_LOGIN_SUCCESS;
  authenticatedUser: U;
}

export const SILENT_LOGIN_FAILURE = 'auth/silent-login-failure';
export interface SilentLoginFailureAction {
  type: typeof SILENT_LOGIN_FAILURE;
  failureReason: string;
}

export const performSilentLogin = (): PerformSilentLoginAction => ({ type: PERFORM_SILENT_LOGIN });
export const requestedSilentLogin = (credentials: UserCredentials): RequestedSilentLoginAction => ({
  type: REQUESTED_SILENT_LOGIN,
  credentials,
});
export const silentLoginSuccess = <U>(authenticatedUser: U): SilentLoginSuccessAction<U> => ({
  type: SILENT_LOGIN_SUCCESS,
  authenticatedUser,
});
export const silentLoginFailure = (failureReason: string): SilentLoginFailureAction => ({
  type: SILENT_LOGIN_FAILURE,
  failureReason,
});

// Logout
export const PERFORM_LOGOUT = 'auth/perform-logout';
export interface PerformLogoutAction {
  type: typeof PERFORM_LOGOUT;
}

export const REQUESTED_LOGOUT = 'auth/requested-logout';
export interface RequestLogoutAction {
  type: typeof REQUESTED_LOGOUT;
}

export const LOGGED_OUT = 'auth/logout-success';
export interface LoggedOutAction {
  type: typeof LOGGED_OUT;
}

// All Actions
export type AuthenticationAction<U> =
  | PerformManualLoginAction
  | RequestedManualLoginAction
  | ManualLoginSuccessAction<U>
  | ManualLoginFailureAction
  | PerformSilentLoginAction
  | RequestedSilentLoginAction
  | SilentLoginSuccessAction<U>
  | SilentLoginFailureAction
  | PerformLogoutAction
  | RequestLogoutAction
  | LoggedOutAction;
