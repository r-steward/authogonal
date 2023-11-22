"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryUserAuthenticator = void 0;
const user_authenticator_1 = require("./user-authenticator");
const lodash_1 = require("lodash");
/**
 * Simple in memory authenticator to authenticate login and password attempts
 * For UI demo usage
 */
class InMemoryUserAuthenticator {
    constructor(userMap, errorMessage, delay = 0) {
        this._userMap = userMap;
        this._errorMessage = errorMessage;
        this._delay = delay;
    }
    authenticate(userCredentials) {
        if (userCredentials.credentialType === user_authenticator_1.LOGIN) {
            const credential = userCredentials.credentials;
            const entry = this._userMap.get(credential.userId);
            if (entry != null && (0, lodash_1.isEqual)(entry.credential, credential.password)) {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve({ user: entry.user, tokens: null, type: user_authenticator_1.SUCCESS });
                    }, this._delay);
                });
            }
            else {
                return Promise.reject({
                    userCredentials,
                    loginMessage: this._errorMessage,
                });
            }
        }
    }
    logout() {
        // do nothing
        return Promise.resolve();
    }
}
exports.InMemoryUserAuthenticator = InMemoryUserAuthenticator;
