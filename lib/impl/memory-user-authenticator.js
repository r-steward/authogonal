"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
class InMemoryUserAuthenticator {
    constructor(userMap, errorMessage, delay = 0) {
        this._userMap = userMap;
        this._errorMessage = errorMessage;
        this._delay = delay;
    }
    authenticate(userCredentials) {
        const credential = userCredentials.credential;
        const entry = this._userMap.get(credential.userId);
        if (entry != null && lodash_1.isEqual(entry.credential, credential.password)) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(entry.user);
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
    logout() {
        // do nothing
        return Promise.resolve();
    }
}
exports.InMemoryUserAuthenticator = InMemoryUserAuthenticator;
