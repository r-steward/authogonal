import { AuthenticationState } from './authentication-state';
import * as AuthActions from '../flux-actions';

export const baseState: AuthenticationState<any> = Object.freeze({ isAuthorized: false, actionState: {} });
export type StateHandler<U> = (
  state: AuthenticationState<U>,
  action: AuthActions.AuthenticationAction<U>,
) => AuthenticationState<U>;

export function handleAuthAction<U>(
  state: AuthenticationState<U> = baseState,
  action: AuthActions.AuthenticationAction<U>,
): AuthenticationState<U> {
  switch (action.type) {
    case AuthActions.REQUESTED_MANUAL_LOGIN:
      return startLogin(state, action);
    case AuthActions.MANUAL_LOGIN_SUCCESS:
      return loginSuccess(state, action);
    case AuthActions.MANUAL_LOGIN_FAILURE:
      return loginFailure(state, action);
    case AuthActions.REQUESTED_SILENT_LOGIN:
      return startSilentLogin(state, action);
    case AuthActions.SILENT_LOGIN_SUCCESS:
      return silentLoginSuccess(state, action);
    case AuthActions.SILENT_LOGIN_FAILURE:
      return silentLoginFailure(state, action);
    case AuthActions.REQUESTED_LOGOUT:
      return startLogout(state, action);
    case AuthActions.LOGGED_OUT:
      return loggedOut(state, action);
    default:
      return state;
  }
}

function startLogin<U>(
  state: AuthenticationState<U>,
  _: AuthActions.RequestedManualLoginAction,
): AuthenticationState<U> {
  return {
    ...state,
    actionState: {
      ...state.actionState,
      isPendingLogin: true,
    },
  };
}

function loginSuccess<U>(
  state: AuthenticationState<U>,
  action: AuthActions.ManualLoginSuccessAction<U>,
): AuthenticationState<U> {
  return {
    ...state,
    isAuthorized: true,
    authenticatedUser: action.authenticatedUser,
    actionState: {
      isPendingLogout: false,
      isPendingLogin: false,
      loginFailed: false,
    },
  };
}

function loginFailure<U>(
  state: AuthenticationState<U>,
  action: AuthActions.ManualLoginFailureAction,
): AuthenticationState<U> {
  return {
    ...state,
    isAuthorized: false,
    authenticatedUser: null,
    actionState: {
      isPendingLogout: false,
      isPendingLogin: false,
      loginFailed: true,
      loginMessage: action.failureReason,
    },
  };
}

function startSilentLogin<U>(
  state: AuthenticationState<U>,
  _: AuthActions.RequestedSilentLoginAction,
): AuthenticationState<U> {
  return {
    ...state,
    actionState: {
      ...state.actionState,
      isPendingLogin: true,
    },
  };
}

function silentLoginSuccess<U>(
  state: AuthenticationState<U>,
  action: AuthActions.SilentLoginSuccessAction<U>,
): AuthenticationState<U> {
  return {
    ...state,
    isAuthorized: true,
    authenticatedUser: action.authenticatedUser,
    actionState: {
      isPendingLogout: false,
      isPendingLogin: false,
      loginFailed: false,
    },
  };
}

function silentLoginFailure<U>(
  state: AuthenticationState<U>,
  action: AuthActions.SilentLoginFailureAction,
): AuthenticationState<U> {
  return {
    ...state,
    isAuthorized: false,
    authenticatedUser: null,
    actionState: {
      isPendingLogout: false,
      isPendingLogin: false,
      loginFailed: true,
      loginMessage: action.failureReason,
    },
  };
}

function startLogout<U>(state: AuthenticationState<U>, _: AuthActions.RequestLogoutAction): AuthenticationState<U> {
  return {
    ...state,
    actionState: {
      ...state,
      isPendingLogout: true,
    },
  };
}

function loggedOut<U>(state: AuthenticationState<U>, action: AuthActions.LoggedOutAction): AuthenticationState<U> {
  return {
    ...state,
    isAuthorized: false,
    authenticatedUser: null,
    actionState: {
      isPendingLogout: false,
      isPendingLogin: false,
      loginFailed: false,
    },
  };
}
