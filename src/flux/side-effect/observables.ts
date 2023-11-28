import {
  LogoutActions,
  LogoutCallback,
  ManualLoginActions,
  ManualLoginCallback,
  SilentLoginActions,
  SilentLoginCallback,
} from '../access-manager';
import {
  LOGGED_OUT,
  MANUAL_LOGIN_FAILURE,
  MANUAL_LOGIN_SUCCESS,
  SILENT_LOGIN_FAILURE,
  SILENT_LOGIN_SUCCESS,
} from '../flux-actions';

interface ObserverLike<T> {
  next: (value: T) => void;
  complete: () => void;
}

/**
 * Converts an observer to a callback to pass to the AccessManager for manual login
 */
export const observerToManualLoginCallback = <U>(
  observer: ObserverLike<ManualLoginActions<U>>,
): ManualLoginCallback<U> => {
  return e => {
    observer.next(e);
    if (e.type === MANUAL_LOGIN_SUCCESS || e.type === MANUAL_LOGIN_FAILURE) {
      observer.complete();
    }
  };
};

/**
 * Converts an observer to a callback to pass to the AccessManager for silent login
 */
export const observerToSilentLoginCallback = <U>(
  observer: ObserverLike<SilentLoginActions<U>>,
): SilentLoginCallback<U> => {
  return e => {
    observer.next(e);
    if (e.type === SILENT_LOGIN_SUCCESS || e.type === SILENT_LOGIN_FAILURE) {
      observer.complete();
    }
  };
};

/**
 * Converts an observer to a callback to pass to the AccessManager for logout
 */
export const observerToLogoutCallback = (observer: ObserverLike<LogoutActions>): LogoutCallback => {
  return e => {
    observer.next(e);
    if (e.type === LOGGED_OUT) {
      observer.complete();
    }
  };
};
