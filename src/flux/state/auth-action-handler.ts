import { AuthenticationState } from './authentication-state';
import * as AuthActions from '../flux-actions';

const baseState: AuthenticationState<any> = { isAuthorized: false, actionState: {} };

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
      loginMessage: null,
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
      loginMessage: null,
    },
  };
}
