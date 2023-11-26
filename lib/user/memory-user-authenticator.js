"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryUserAuthenticator = void 0;
const lodash_1 = require("lodash");
const user_authenticator_1 = require("./user-authenticator");
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
                const tokens = null;
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve((0, user_authenticator_1.createSuccessResponse)(entry.user, tokens));
                    }, this._delay);
                });
            }
            else {
                return Promise.resolve((0, user_authenticator_1.createErrorResponse)(this._errorMessage));
            }
        }
    }
}
exports.InMemoryUserAuthenticator = InMemoryUserAuthenticator;
