import { UserCredentials } from '../user-authentication';
export declare const START_LOGIN = "auth/start-login";
export interface StartLoginAction {
    type: 'auth/start-login';
}
export declare const LOGIN_SUCCESS = "auth/login-sucess";
export interface LoginSuccessAction<U> {
    type: 'auth/login-sucess';
    payload: LoginSuccessPayload<U>;
}
export interface LoginSuccessPayload<U> {
    userCredentials: UserCredentials;
    authenticatedUser: U;
}
export declare const LOGIN_FAILURE = "auth/login-failed";
export interface LoginFailedAction {
    type: 'auth/login-failed';
    payload: {
        userCredentials: UserCredentials;
        failureReason: string;
    };
}
export declare const START_LOGOUT = "auth/start-logout";
export interface StartLogoutAction {
    type: 'auth/start-logout';
}
export declare const LOGGED_OUT = "auth/logout-success";
export interface LoggedOutAction {
    type: 'auth/logout-success';
}
export declare type AuthenticationAction<U> = StartLoginAction | LoginSuccessAction<U> | LoginFailedAction | StartLogoutAction | LoggedOutAction;
