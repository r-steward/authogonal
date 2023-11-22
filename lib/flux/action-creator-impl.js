"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const flux_actions_1 = require("./flux-actions");
class AuthenticationActionCreatorImpl {
    constructor(authDispatcher, userAuthenticator) {
        this._authDispatcher = authDispatcher;
        this._userAuthenticator = userAuthenticator;
    }
    performLogin(userCredentials) {
        return __awaiter(this, void 0, void 0, function* () {
            // dispatch login start
            this._authDispatcher({ type: flux_actions_1.START_LOGIN });
            // log in asynchronously
            try {
                const authenticatedUser = yield this._userAuthenticator.authenticate(userCredentials);
                // dispatch the login success
                this._authDispatcher({
                    type: flux_actions_1.LOGIN_SUCCESS,
                    payload: {
                        userCredentials,
                        authenticatedUser,
                    },
                });
            }
            catch (error) {
                // dispatch the login failure
                this._authDispatcher({
                    type: flux_actions_1.LOGIN_FAILURE,
                    payload: {
                        userCredentials,
                        failureReason: error.message,
                    },
                });
            }
        });
    }
    performLogout(logoutInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            // dispatch logout start
            this._authDispatcher({ type: flux_actions_1.START_LOGOUT });
            // perform logout
            try {
                yield this._userAuthenticator.logout(logoutInfo);
            }
            finally {
                // dispatch logout
                this._authDispatcher({ type: flux_actions_1.LOGGED_OUT });
            }
        });
    }
    invalidateAuthorization() {
        // dispatch logout
        this._authDispatcher({ type: flux_actions_1.LOGGED_OUT });
        //
        return Promise.resolve();
    }
}
exports.AuthenticationActionCreatorImpl = AuthenticationActionCreatorImpl;
