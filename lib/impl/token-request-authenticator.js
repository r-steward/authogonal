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
const fourspace_logger_ts_1 = require("fourspace-logger-ts");
const LOGGER = fourspace_logger_ts_1.LogFactory.getLogger('request-token-authenticator');
class TokenRequestAuthenticator {
    constructor(tokenProvider) {
        this._tokenProvider = tokenProvider;
    }
    authorizeRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            if (LOGGER.isDebugEnabled) {
                LOGGER.debug('Authorizing request');
            }
            const tokenResponse = yield this._tokenProvider.authorizationToken();
            if (tokenResponse == null) {
                return request;
            }
            return setAuthorizationHeader(request, tokenResponse);
        });
    }
}
exports.TokenRequestAuthenticator = TokenRequestAuthenticator;
function setAuthorizationHeader(request, value) {
    return request.set('Authorization', value);
}
exports.setAuthorizationHeader = setAuthorizationHeader;
