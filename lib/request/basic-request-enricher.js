"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicRequestEnricher = void 0;
const logging_facade_1 = require("logging-facade");
const LOGGER = logging_facade_1.LogFactory.getLogger('basic-request-authenticator');
/**
 * Basic request authenticator
 * Updates a request with basic auth info from user authentication object
 */
class BasicRequestEnricher {
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
exports.BasicRequestEnricher = BasicRequestEnricher;
