"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultTokenManager = void 0;
const logging_facade_1 = require("logging-facade");
const token_manager_1 = require("./token-manager");
const LOGGER = logging_facade_1.LogFactory.getLogger('DefaultTokenManager');
/**
 * Manages access/refresh/remember tokens in any token storage implementation
 */
class DefaultTokenManager {
    constructor(_accessStorage, _refreshStorage, _rememberMeStorage, _expiryDecoder, _dateProvider) {
        this._accessStorage = _accessStorage;
        this._refreshStorage = _refreshStorage;
        this._rememberMeStorage = _rememberMeStorage;
        this._expiryDecoder = _expiryDecoder;
        this._dateProvider = _dateProvider;
    }
    setTokenFromResponse(r) {
        // set access and refresh if present
        if ((r === null || r === void 0 ? void 0 : r.accessToken) != null && (r === null || r === void 0 ? void 0 : r.refreshToken) != null) {
            this.setToken({ token: r.accessToken, type: token_manager_1.TokenType.AccessToken });
            this.setToken({ token: r.refreshToken, type: token_manager_1.TokenType.RefreshToken });
        }
        // set remember me if present
        if ((r === null || r === void 0 ? void 0 : r.rememberMeToken) != null) {
            this.setToken({ token: r.rememberMeToken, type: token_manager_1.TokenType.RememberMeToken });
        }
    }
    setToken(t) {
        switch (t === null || t === void 0 ? void 0 : t.type) {
            case token_manager_1.TokenType.AccessToken:
                this._accessStorage.setToken(t.token);
                break;
            case token_manager_1.TokenType.RefreshToken:
                this._refreshStorage.setToken(t.token);
                break;
            case token_manager_1.TokenType.RememberMeToken:
                this._rememberMeStorage.setToken(t.token);
                break;
        }
    }
    removeTokens() {
        this._accessStorage.deleteToken();
        this._refreshStorage.deleteToken();
        this._rememberMeStorage.deleteToken();
    }
    getToken(type) {
        switch (type) {
            case token_manager_1.TokenType.AccessToken:
                return this.getAccessTokenStatus();
            case token_manager_1.TokenType.RefreshToken:
                return this.getRefreshTokenStatus();
            case token_manager_1.TokenType.RememberMeToken:
                return this.getRememberMeTokenStatus();
            default:
                return { type, isExpired: true, token: null };
        }
    }
    // --- private methods ----
    getAccessTokenStatus() {
        const token = this._accessStorage.getToken();
        return {
            isExpired: this.isTokenExpired(token),
            token,
            type: token_manager_1.TokenType.AccessToken,
        };
    }
    getRefreshTokenStatus() {
        const token = this._refreshStorage.getToken();
        return {
            isExpired: this.isTokenExpired(token),
            token,
            type: token_manager_1.TokenType.RefreshToken,
        };
    }
    getRememberMeTokenStatus() {
        const token = this._rememberMeStorage.getToken();
        return {
            isExpired: this.isTokenExpired(token),
            token,
            type: token_manager_1.TokenType.RememberMeToken,
        };
    }
    isTokenExpired(token) {
        if (token == null) {
            return true;
        }
        const tokenDate = this._expiryDecoder.decode(token);
        const now = this._dateProvider.getDateTime();
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug(`Checking token expiry: token date <${tokenDate}> should be less than <${now}>`);
        }
        return tokenDate == null || tokenDate >= now;
    }
}
exports.DefaultTokenManager = DefaultTokenManager;
