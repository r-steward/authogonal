import { DateProvider } from '../date-provider';
import { AccessTokenResponse, StringTokenStorage, TokenAndType, TokenAndTypeStatus, TokenExpiryDecoder, TokenManager, TokenType } from './token-manager';
/**
 * Manages access/refresh/remember tokens in any token storage implementation
 */
export declare class DefaultTokenManager implements TokenManager {
    private readonly _accessStorage;
    private readonly _refreshStorage;
    private readonly _rememberMeStorage;
    private readonly _expiryDecoder;
    private readonly _dateProvider;
    constructor(_accessStorage: StringTokenStorage, _refreshStorage: StringTokenStorage, _rememberMeStorage: StringTokenStorage, _expiryDecoder: TokenExpiryDecoder, _dateProvider: DateProvider);
    setTokenFromResponse(r: AccessTokenResponse): void;
    setToken(t: TokenAndType): void;
    removeTokens(): void;
    getToken(type: TokenType): TokenAndTypeStatus | Promise<TokenAndTypeStatus>;
    private getAccessTokenStatus;
    private getRefreshTokenStatus;
    private getRememberMeTokenStatus;
    private isTokenExpired;
}
