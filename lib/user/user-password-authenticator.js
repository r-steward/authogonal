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
exports.UserPasswordAuthenticator = void 0;
const logging_facade_1 = require("logging-facade");
const user_authenticator_1 = require("./user-authenticator");
const LOGGER = logging_facade_1.LogFactory.getLogger('user-password-authenticator');
class UserPasswordAuthenticator {
    constructor(_userService, _loginService) {
        this._userService = _userService;
        this._loginService = _loginService;
    }
    authenticate(userCredentials) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userCredentials.credentialType === user_authenticator_1.LOGIN) {
                // log in to start a user token session, and save the tokens
                const credential = userCredentials.credentials;
                const tokens = yield this._loginService.loginWithUserId(credential.userId, credential.password, credential.remember);
                const user = yield this._userService.getUserDetails(tokens.accessToken);
                return {
                    type: user_authenticator_1.SUCCESS,
                    user, tokens
                };
            }
            else {
                LOGGER.warn(`Incorrect credential type ${userCredentials.credentialType} received`);
                return Promise.resolve(null);
            }
        });
    }
}
exports.UserPasswordAuthenticator = UserPasswordAuthenticator;
