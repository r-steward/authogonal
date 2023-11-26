"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAuthAction = exports.baseState = void 0;
const AuthActions = __importStar(require("../flux-actions"));
exports.baseState = Object.freeze({ isAuthorized: false, actionState: {} });
function handleAuthAction(state = exports.baseState, action) {
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
exports.handleAuthAction = handleAuthAction;
function startLogin(state, _) {
    return Object.assign(Object.assign({}, state), { actionState: Object.assign(Object.assign({}, state.actionState), { isPendingLogin: true }) });
}
function loginSuccess(state, action) {
    return Object.assign(Object.assign({}, state), { isAuthorized: true, authenticatedUser: action.authenticatedUser, actionState: {
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
            loginMessage: action.failureReason,
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
