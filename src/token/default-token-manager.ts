import { LogFactory } from 'logging-facade';
import { DateProvider } from '../date-provider';
import {
  LifecycleTokens,
  RefreshTokensStatus,
  StringTokenStorage,
  TokenAndType,
  TokenAndTypeStatus,
  TokenExpiryDecoder,
  TokenManager,
  TokenType,
} from './token-manager';

const LOGGER = LogFactory.getLogger('DefaultTokenManager');

/**
 * Manages access/refresh/remember tokens in any token storage implementation
 */
export class DefaultTokenManager implements TokenManager {
  private refreshInProgress: Promise<LifecycleTokens>;

  constructor(
    private readonly _accessStorage: StringTokenStorage,
    private readonly _refreshStorage: StringTokenStorage,
    private readonly _rememberMeStorage: StringTokenStorage,
    private readonly _expiryDecoder: TokenExpiryDecoder,
    private readonly _dateProvider: DateProvider,
  ) { }

  public get hasTokens(): boolean {
    return this.refreshInProgress != null || this._accessStorage.getToken() != null;
  }

  public refreshTokens(refreshInProgress: Promise<LifecycleTokens>) {
    this.refreshInProgress = refreshInProgress;
    this.refreshInProgress.then(t => this.setTokenFromResponse(t));
  }

  public getTokensForRefresh(): RefreshTokensStatus {
    return {
      refreshTokenStatus: this.getRefreshTokenStatus(),
      rememberMeTokenStatus: this.getRememberMeTokenStatus()
    }
  }

  public async accessTokenRemaining(): Promise<number> {
    if (this.refreshInProgress != null) {
      await this.refreshInProgress;
    }
    const token = this._accessStorage.getToken();
    return this.tokenHeadroom(token);
  }

  public removeTokens(): void {
    this._accessStorage.deleteToken();
    this._refreshStorage.deleteToken();
    this._rememberMeStorage.deleteToken();
  }

  // --- private methods ----

  private setTokenFromResponse(r: LifecycleTokens): void {
    if (r == null) {
      this.removeTokens();
    } else {
      // set access and refresh
      this.setToken({ token: r.accessToken, type: TokenType.AccessToken });
      this.setToken({ token: r.refreshToken, type: TokenType.RefreshToken });
      // set remember me if present
      if (r.rememberMeToken != null) {
        this.setToken({ token: r.rememberMeToken, type: TokenType.RememberMeToken });
      }
    }
  }

  private setToken(t: TokenAndType) {
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

  public async getToken(type: TokenType): Promise<TokenAndTypeStatus> {
    if (this.refreshInProgress != null) {
      await this.refreshInProgress;
    }
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

  private getAccessTokenStatus(): TokenAndTypeStatus {
    const token = this._accessStorage.getToken();
    return {
      isExpired: this.isTokenExpired(token),
      token,
      type: TokenType.AccessToken,
    };
  }

  private getRefreshTokenStatus(): TokenAndTypeStatus {
    const token = this._refreshStorage.getToken();
    return {
      isExpired: this.isTokenExpired(token),
      token,
      type: TokenType.RefreshToken,
    };
  }

  private getRememberMeTokenStatus(): TokenAndTypeStatus {
    const token = this._rememberMeStorage.getToken();
    return {
      isExpired: this.isTokenExpired(token),
      token,
      type: TokenType.RememberMeToken,
    };
  }

  private tokenHeadroom(token: string) {
    if (token == null) {
      return 0;
    }
    const tokenDate = this._expiryDecoder.decode(token);
    const now = this._dateProvider.getDateTime();
    const diff = tokenDate.getTime() - now.getTime();
    if (LOGGER.isDebugEnabled()) {
      LOGGER.debug(`Checking token headroom: token expiry is <${diff / 1000}> seconds from now`);
    }
    return diff;
  }

  private isTokenExpired(token: string) {
    if (token == null) {
      return true;
    }
    const tokenDate = this._expiryDecoder.decode(token);
    const now = this._dateProvider.getDateTime();
    if (LOGGER.isDebugEnabled()) {
      LOGGER.debug(`Checking token expiry: token date <${tokenDate}> should be less than <${now}>`)
    }
    return tokenDate == null || tokenDate >= now;
  }
}
