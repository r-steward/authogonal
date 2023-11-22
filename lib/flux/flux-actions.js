"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOGGED_OUT = exports.REQUESTED_LOGOUT = exports.PERFORM_LOGOUT = exports.silentLoginFailure = exports.silentLoginSuccess = exports.requestedSilentLogin = exports.performSilentLogin = exports.SILENT_LOGIN_FAILURE = exports.SILENT_LOGIN_SUCCESS = exports.REQUESTED_SILENT_LOGIN = exports.PERFORM_SILENT_LOGIN = exports.manualLoginFailure = exports.manualLoginSuccess = exports.requestedManualLogin = exports.performManualLogin = exports.MANUAL_LOGIN_FAILURE = exports.MANUAL_LOGIN_SUCCESS = exports.REQUESTED_MANUAL_LOGIN = exports.PERFORM_MANUAL_LOGIN = void 0;
// Manual Login
exports.PERFORM_MANUAL_LOGIN = 'auth/perform-manual-login';
exports.REQUESTED_MANUAL_LOGIN = 'auth/requested-manual-login';
exports.MANUAL_LOGIN_SUCCESS = 'auth/manual-login-sucess';
exports.MANUAL_LOGIN_FAILURE = 'auth/manual-login-failure';
const performManualLogin = (credentials) => ({ type: exports.PERFORM_MANUAL_LOGIN, credentials });
exports.performManualLogin = performManualLogin;
const requestedManualLogin = (credentials) => ({ type: exports.REQUESTED_MANUAL_LOGIN, credentials });
exports.requestedManualLogin = requestedManualLogin;
const manualLoginSuccess = (authenticatedUser) => ({ type: exports.MANUAL_LOGIN_SUCCESS, authenticatedUser });
exports.manualLoginSuccess = manualLoginSuccess;
const manualLoginFailure = (failureReason) => ({ type: exports.MANUAL_LOGIN_FAILURE, failureReason });
exports.manualLoginFailure = manualLoginFailure;
// Silent login
exports.PERFORM_SILENT_LOGIN = 'auth/perform-silent-login';
exports.REQUESTED_SILENT_LOGIN = 'auth/requested-silent-login';
exports.SILENT_LOGIN_SUCCESS = 'auth/silent-login-sucess';
exports.SILENT_LOGIN_FAILURE = 'auth/silent-login-failure';
const performSilentLogin = () => ({ type: exports.PERFORM_SILENT_LOGIN });
exports.performSilentLogin = performSilentLogin;
const requestedSilentLogin = (credentials) => ({ type: exports.REQUESTED_SILENT_LOGIN, credentials });
exports.requestedSilentLogin = requestedSilentLogin;
const silentLoginSuccess = (authenticatedUser) => ({ type: exports.SILENT_LOGIN_SUCCESS, authenticatedUser });
exports.silentLoginSuccess = silentLoginSuccess;
const silentLoginFailure = (failureReason) => ({ type: exports.SILENT_LOGIN_FAILURE, failureReason });
exports.silentLoginFailure = silentLoginFailure;
// Logout
exports.PERFORM_LOGOUT = 'auth/perform-logout';
exports.REQUESTED_LOGOUT = 'auth/requested-logout';
exports.LOGGED_OUT = 'auth/logout-success';
