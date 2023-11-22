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
const token_1 = require("../token");
const LOGGER = fourspace_logger_ts_1.LogFactory.getLogger('token-manager');
class TokenManagerImpl {
    constructor(accessStorage, refreshStorage, rememberMeStorage, expiryDecoder, dateProvider, authTokenService) {
        this._accessStorage = accessStorage;
        this._refreshStorage = refreshStorage;
        this._rememberMeStorage = rememberMeStorage;
        this._expiryDecoder = expiryDecoder;
        this._dateProvider = dateProvider;
        this._authTokenService = authTokenService;
    }
    setTokenFromResponse(r) {
        // set access and refresh if present
        if ((r === null || r === void 0 ? void 0 : r.accessToken) != null && (r === null || r === void 0 ? void 0 : r.refreshToken) != null) {
            this.setToken({ token: r.accessToken, type: token_1.TokenType.AccessToken });
            this.setToken({ token: r.refreshToken, type: token_1.TokenType.RefreshToken });
        }
        // set remember me if present
        if ((r === null || r === void 0 ? void 0 : r.rememberMeToken) != null) {
            this.setToken({ token: r.rememberMeToken, type: token_1.TokenType.RememberMeToken });
        }
    }
    setToken(t) {
        switch (t === null || t === void 0 ? void 0 : t.type) {
            case token_1.TokenType.AccessToken:
                this._accessStorage.setToken(t.token);
                break;
            case token_1.TokenType.RefreshToken:
                this._refreshStorage.setToken(t.token);
                break;
            case token_1.TokenType.RememberMeToken:
                this._rememberMeStorage.setToken(t.token);
                break;
        }
    }
    removeTokens() {
        this._accessStorage.deleteToken();
        this._refreshStorage.deleteToken();
        this._rememberMeStorage.deleteToken();
    }
    getLatestAccessToken() {
        const t = this.getUnexpiredToken();
        if ((t === null || t === void 0 ? void 0 : t.type) == null)
            return null;
        // if access token is unexpired, return it
        if (t.type === token_1.TokenType.AccessToken) {
            return t.token;
        }
        // otherwise update the token from either refresh or remember me
        return this.updateAccessToken(t);
    }
    hasUnexpiredToken() {
        const t = this.getUnexpiredToken();
        return (t === null || t === void 0 ? void 0 : t.token) != null;
    }
    getUnexpiredToken() {
        const access = this.getUnexpiredAccessToken();
        if (access != null) {
            return { token: access, type: token_1.TokenType.AccessToken };
        }
        const refresh = this.getUnexpiredRefreshToken();
        if (refresh != null) {
            return { token: refresh, type: token_1.TokenType.RefreshToken };
        }
        const rememberMe = this.getUnexpiredRememberMeToken();
        if (rememberMe != null) {
            return { token: rememberMe, type: token_1.TokenType.RememberMeToken };
        }
        return { token: null, type: null };
    }
    authorizationToken() {
        return this.getLatestAccessToken();
    }
    // --- private methods ----
    getUnexpiredAccessToken() {
        const token = this._accessStorage.getToken();
        return this.isTokenExpired(token) ? null : token;
    }
    getUnexpiredRefreshToken() {
        const token = this._refreshStorage.getToken();
        return this.isTokenExpired(token) ? null : token;
    }
    getUnexpiredRememberMeToken() {
        const token = this._rememberMeStorage.getToken();
        return this.isTokenExpired(token) ? null : token;
    }
    isTokenExpired(token) {
        const tokenDate = this._expiryDecoder.decode(token);
        const now = this._dateProvider.getDateTime();
        return tokenDate == null || tokenDate < now;
    }
    updateAccessToken(t) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.doRefresh(t);
                if (response != null) {
                    this._accessStorage.setToken(response.accessToken);
                    this._refreshStorage.setToken(response.refreshToken);
                    return response.accessToken;
                }
            }
            catch (e) {
                LOGGER.warn('Token refresh failed ', e);
            }
            return null;
        });
    }
    doRefresh(t) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (t === null || t === void 0 ? void 0 : t.type) {
                case token_1.TokenType.RefreshToken:
                    return yield this._authTokenService.refreshFromRefreshToken(t.token);
                case token_1.TokenType.RememberMeToken:
                    return yield this._authTokenService.refreshFromRememberMeToken(t.token);
            }
            return null;
        });
    }
}
exports.TokenManagerImpl = TokenManagerImpl;
