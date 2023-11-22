import { AuthTokenService } from '../auth-service';
import { DateProvider } from '../date-provider';
import { AccessTokenResponse, TokenAndType, TokenExpiryDecoder, TokenManager } from '../token';
import { TokenProvider } from '../token-provider';
import { StringTokenStorage } from '../util';
export declare class TokenManagerImpl implements TokenManager, TokenProvider {
    private _accessStorage;
    private _refreshStorage;
    private _rememberMeStorage;
    private _expiryDecoder;
    private _dateProvider;
    private _authTokenService;
    constructor(accessStorage: StringTokenStorage, refreshStorage: StringTokenStorage, rememberMeStorage: StringTokenStorage, expiryDecoder: TokenExpiryDecoder, dateProvider: DateProvider, authTokenService: AuthTokenService);
    setTokenFromResponse(r: AccessTokenResponse): void;
    setToken(t: TokenAndType): void;
    removeTokens(): void;
    getLatestAccessToken(): string | Promise<string>;
    hasUnexpiredToken(): boolean;
    getUnexpiredToken(): TokenAndType;
    authorizationToken(): string | Promise<string>;
    private getUnexpiredAccessToken;
    private getUnexpiredRefreshToken;
    private getUnexpiredRememberMeToken;
    private isTokenExpired;
    private updateAccessToken;
    private doRefresh;
}
