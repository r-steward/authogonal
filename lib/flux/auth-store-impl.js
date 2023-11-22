"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fourspace_flux_ts_1 = require("fourspace-flux-ts");
const auth_action_handler_1 = require("./auth-action-handler");
class AuthenticationStoreImpl extends fourspace_flux_ts_1.AbstractDispatcherStore {
    constructor(dispatcher, baseState = { isAuthorized: false, actionState: {} }) {
        super('AuthStore', dispatcher, new fourspace_flux_ts_1.EmitterImpl());
        this._userAuthentication = baseState;
    }
    getState() {
        return this._userAuthentication;
    }
    generateChange(action) {
        const oldState = this._userAuthentication;
        const newState = auth_action_handler_1.handleAuthAction(oldState, action);
        if (oldState !== newState) {
            this._userAuthentication = newState;
            return true;
        }
        return false;
    }
    doHandle(payload) {
        return true;
    }
}
exports.AuthenticationStoreImpl = AuthenticationStoreImpl;
