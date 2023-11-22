import { LogFactory } from 'logging-facade';
import { DateProvider } from '../date-provider';
import { AccessTokenResponse, StringTokenStorage, TokenAndType, TokenAndTypeStatus, TokenExpiryDecoder, TokenManager, TokenType } from './token-manager';
import { TokenLoginService } from '../api/auth-service';

const LOGGER = LogFactory.getLogger('token-manager');

/**
 * Manages access/refresh/remember tokens in any token storage implementation
 */
export class DefaultTokenManager implements TokenManager {

  constructor(
    private readonly _accessStorage: StringTokenStorage,
    private readonly _refreshStorage: StringTokenStorage,
    private readonly _rememberMeStorage: StringTokenStorage,
    private readonly _expiryDecoder: TokenExpiryDecoder,
    private readonly _dateProvider: DateProvider,
  ) {
  }

  public setTokenFromResponse(r: AccessTokenResponse): void {
    // set access and refresh if present
    if (r?.accessToken != null && r?.refreshToken != null) {
      this.setToken({ token: r.accessToken, type: TokenType.AccessToken });
      this.setToken({ token: r.refreshToken, type: TokenType.RefreshToken });
    }
    // set remember me if present
    if (r?.rememberMeToken != null) {
      this.setToken({ token: r.rememberMeToken, type: TokenType.RememberMeToken });
    }
  }

  public setToken(t: TokenAndType) {
    switch (t?.type) {
      case TokenType.AccessToken:
        this._accessStorage.setToken(t.token);
        break;
      case TokenType.RefreshToken:
        this._refreshStorage.setToken(t.token);
        break;
      case TokenType.RememberMeToken:
        this._rememberMeStorage.setToken(t.token);
        break;
    }
  }

  public removeTokens(): void {
    this._accessStorage.deleteToken();
    this._refreshStorage.deleteToken();
    this._rememberMeStorage.deleteToken();
  }

  public getToken(type: TokenType): TokenAndTypeStatus | Promise<TokenAndTypeStatus> {
    switch (type) {
      case TokenType.AccessToken:
        return this.getAccessTokenStatus();
      case TokenType.RefreshToken:
        return this.getRefreshTokenStatus();
      case TokenType.RememberMeToken:
        return this.getRememberMeTokenStatus();
      default:
        return { type, isExpired: true, token: null };
    }
  }


  // public getLatestAccessToken(): string | Promise<string> {
  //   const t = this.getUnexpiredToken();
  //   if (t?.type == null) return null;
  //   // if access token is unexpired, return it
  //   if (t.type === TokenType.AccessToken) {
  //     return t.token;
  //   }
  //   // otherwise update the token from either refresh or remember me
  //   return this.updateAccessToken(t);
  // }

  public hasUnexpiredToken(): boolean {
    const t = this.getUnexpiredToken();
    return t?.token != null;
  }

  public getUnexpiredToken(): TokenAndType {
    const access = this.getUnexpiredAccessToken();
    if (access != null) {
      return { token: access, type: TokenType.AccessToken };
    }
    const refresh = this.getUnexpiredRefreshToken();
    if (refresh != null) {
      return { token: refresh, type: TokenType.RefreshToken };
    }
    const rememberMe = this.getUnexpiredRememberMeToken();
    if (rememberMe != null) {
      return { token: rememberMe, type: TokenType.RememberMeToken };
    }
    return { token: null, type: null };
  }

  public authorizationToken(): string | Promise<string> {
    return this.getLatestAccessToken();
  }

  // --- private methods ----
  private getAccessTokenStatus(): TokenAndTypeStatus {
    const token = this._accessStorage.getToken();
    return {
      isExpired: this.isTokenExpired(token),
      token,
      type: TokenType.AccessToken
    }
  }

  private getRefreshTokenStatus(): TokenAndTypeStatus {
    const token = this._refreshStorage.getToken();
    return {
      isExpired: this.isTokenExpired(token),
      token,
      type: TokenType.RefreshToken
    }
  }

  private getRememberMeTokenStatus(): TokenAndTypeStatus {
    const token = this._rememberMeStorage.getToken();
    return {
      isExpired: this.isTokenExpired(token),
      token,
      type: TokenType.RememberMeToken
    }
  }

  private isTokenExpired(token: string) {
    if (token == null) {
      return true;
    }
    const tokenDate = this._expiryDecoder.decode(token);
    const now = this._dateProvider.getDateTime();
    return tokenDate == null || tokenDate < now;
  }


}