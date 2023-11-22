"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fourspace_logger_ts_1 = require("fourspace-logger-ts");
const LOGGER = fourspace_logger_ts_1.LogFactory.getLogger('request-basic-authenticator');
/**
 * Basic request authenticator
 * Updates a request with basic auth info from user authentication object
 */
class BasicRequestAuthenticator {
    constructor(userId, password) {
        this._userId = userId;
        this._password = password;
    }
    authorizeRequest(request) {
        if (LOGGER.isDebugEnabled) {
            LOGGER.debug('Authorizing request');
        }
        return Promise.resolve(request.auth(this._userId, this._password, {
            type: 'basic',
        }));
    }
}
exports.BasicRequestAuthenticator = BasicRequestAuthenticator;
