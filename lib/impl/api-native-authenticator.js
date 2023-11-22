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
const LOGGER = fourspace_logger_ts_1.LogFactory.getLogger('api-user-authenticator');
class ApiNativeAuthenticator {
    constructor(userService, tokenManager, loginCredentialType) {
        this._userService = userService;
        this._tokenManager = tokenManager;
        this._loginCredentialType = loginCredentialType;
    }
    logout(logoutInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const unexpired = this._tokenManager.getUnexpiredToken();
            if ((unexpired === null || unexpired === void 0 ? void 0 : unexpired.token) != null) {
                // logout user
                yield this._userService.logout(unexpired.token);
            }
            // remove tokens
            this._tokenManager.removeTokens();
        });
    }
    authenticate(userCredentials) {
        return __awaiter(this, void 0, void 0, function* () {
            let accessToken = userCredentials.credential;
            if (this._loginCredentialType === userCredentials.credentialType) {
                // log in to start a user token session, and save the tokens
                const credential = userCredentials.credential;
                const tokens = yield this._userService.loginWithUserId(credential.userId, credential.password, credential.remember);
                this._tokenManager.setTokenFromResponse(tokens);
                accessToken = tokens.accessToken;
            }
            // get the user with the token
            return this._userService.getUserDetails(accessToken);
        });
    }
}
exports.ApiNativeAuthenticator = ApiNativeAuthenticator;
