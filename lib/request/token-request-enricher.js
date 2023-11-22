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
exports.setAuthorizationHeader = exports.TokenRequestEnricher = void 0;
const logging_facade_1 = require("logging-facade");
const LOGGER = logging_facade_1.LogFactory.getLogger('request-token-authenticator');
/**
 * Bespoke request enricher that adds an authorization token to the request header
 */
class TokenRequestEnricher {
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
exports.TokenRequestEnricher = TokenRequestEnricher;
function setAuthorizationHeader(request, value) {
    return request.set('Authorization', value);
}
exports.setAuthorizationHeader = setAuthorizationHeader;
