"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.DefaultAccessManager = void 0;
const AuthActions = __importStar(require("./flux-actions"));
const token_manager_1 = require("../token/token-manager");
const user_authenticator_1 = require("../user/user-authenticator");
const logging_facade_1 = require("logging-facade");
const LOGGER = logging_facade_1.LogFactory.getLogger('DefaultAccessManager');
/**
 * Access manager that uses ARR token model
 */
class DefaultAccessManager {
    constructor(userAuthenticator, tokenManager) {
        this.userAuthenticator = userAuthenticator;
        this.tokenManager = tokenManager;
    }
    silentLogin(eventCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            const refreshTokenStatus = yield this.tokenManager.getToken(token_manager_1.TokenType.RefreshToken);
            const rememberMeTokenStatus = yield this.tokenManager.getToken(token_manager_1.TokenType.RememberMeToken);
            if (refreshTokenStatus.isExpired || rememberMeTokenStatus.isExpired) {
                if (LOGGER.isDebugEnabled()) {
                    LOGGER.debug(`No available tokens for silent login ${JSON.stringify(refreshTokenStatus)} ${JSON.stringify(rememberMeTokenStatus)}`);
                }
                eventCallback(AuthActions.silentLoginFailure('no tokens/tokens expired'));
                return false;
            }
            if (!refreshTokenStatus.isExpired) {
                // TODO remove isExpired from following call
                if (LOGGER.isDebugEnabled()) {
                    LOGGER.debug(`Attempting login with refresh token`);
                }
                const credentials = (0, user_authenticator_1.createTokenCredentials)(refreshTokenStatus);
                eventCallback(AuthActions.requestedSilentLogin(credentials));
                const auth = yield this.userAuthenticator.authenticate(credentials);
                if (auth.type === user_authenticator_1.SUCCESS) {
                    this.tokenManager.setTokenFromResponse(auth.tokens);
                    eventCallback(AuthActions.silentLoginSuccess(auth.user));
                    return true;
                }
            }
            if (!rememberMeTokenStatus.isExpired) {
                if (LOGGER.isDebugEnabled()) {
                    LOGGER.debug(`Attempting login with remember me token`);
                }
                // TODO remove isExpired from following call
                const credentials = (0, user_authenticator_1.createTokenCredentials)(rememberMeTokenStatus);
                eventCallback(AuthActions.requestedSilentLogin(credentials));
                const auth = yield this.userAuthenticator.authenticate(credentials);
                if (auth.type === user_authenticator_1.SUCCESS) {
                    this.tokenManager.setTokenFromResponse(auth.tokens);
                    eventCallback(AuthActions.silentLoginSuccess(auth.user));
                    return true;
                }
            }
            eventCallback(AuthActions.silentLoginFailure('no tokens/tokens expired'));
            return false;
        });
    }
    manualLogin(credentials, eventCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            eventCallback(AuthActions.requestedManualLogin(credentials));
            const auth = yield this.userAuthenticator.authenticate(credentials);
            if (auth.type === user_authenticator_1.SUCCESS) {
                this.tokenManager.setTokenFromResponse(auth.tokens);
                eventCallback(AuthActions.manualLoginSuccess(auth.user));
                return true;
            }
            this.tokenManager.removeTokens();
            eventCallback(AuthActions.manualLoginFailure(auth.error));
            return false;
        });
    }
    onUnauthorized() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
}
exports.DefaultAccessManager = DefaultAccessManager;
