"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const flux_actions_1 = require("./flux-actions");
const baseState = { isAuthorized: false, actionState: {} };
function handleAuthAction(state = baseState, action) {
    switch (action.type) {
        case flux_actions_1.START_LOGIN:
            return startLogin(state, action);
        case flux_actions_1.LOGIN_SUCCESS:
            return loginSuccess(state, action);
        case flux_actions_1.LOGIN_FAILURE:
            return loginFailure(state, action);
        case flux_actions_1.START_LOGOUT:
            return startLogout(state, action);
        case flux_actions_1.LOGGED_OUT:
            return loggedOut(state, action);
        default:
            return state;
    }
}
exports.handleAuthAction = handleAuthAction;
function startLogin(state, _) {
    return Object.assign(Object.assign({}, state), { actionState: Object.assign(Object.assign({}, state.actionState), { isPendingLogin: true }) });
}
function loginSuccess(state, action) {
    return Object.assign(Object.assign({}, state), { isAuthorized: true, authenticatedUser: action.payload.authenticatedUser, actionState: {
            isPendingLogout: false,
            isPendingLogin: false,
            loginFailed: false,
            loginMessage: null,
        } });
}
function loginFailure(state, action) {
    return Object.assign(Object.assign({}, state), { isAuthorized: false, authenticatedUser: null, actionState: {
            isPendingLogout: false,
            isPendingLogin: false,
            loginFailed: true,
            loginMessage: action.payload.failureReason,
        } });
}
function startLogout(state, _) {
    return Object.assign(Object.assign({}, state), { actionState: Object.assign(Object.assign({}, state), { isPendingLogout: true }) });
}
function loggedOut(state, action) {
    return Object.assign(Object.assign({}, state), { isAuthorized: false, authenticatedUser: null, actionState: {
            isPendingLogout: false,
            isPendingLogin: false,
            loginFailed: false,
            loginMessage: null,
        } });
}
