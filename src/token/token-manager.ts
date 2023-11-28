export enum TokenType {
  AccessToken = 'AccessToken',
  RefreshToken = 'RefreshToken',
  RememberMeToken = 'RememberMeToken',
}

export interface TokenAndType {
  token: string;
  type: TokenType;
}

export interface TokenAndTypeStatus extends TokenAndType {
  isExpired: boolean;
}

export interface RefreshTokensStatus {
  readonly refreshTokenStatus: TokenAndTypeStatus;
  readonly rememberMeTokenStatus: TokenAndTypeStatus;
}

export interface LifecycleTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly rememberMeToken?: string;
}

/**
 * local storage implementation
 */
export interface StringTokenStorage {
  deleteToken(): void;

  setToken(token: string): string;

  getToken(): string;
}

export interface TokenExpiryDecoder {
  decode(token: string): Date;
}

/**
 * Provides the current authorization token for API requests
 */
export interface TokenProvider {
  authorizationToken(): Promise<string>;
}

/**
 * Interface to authorization tokens
 */
export interface TokenManager {
  hasTokens: boolean;
  accessTokenRemaining(): Promise<number>;
  getToken(type: TokenType): Promise<TokenAndTypeStatus>;
  getTokensForRefresh(): RefreshTokensStatus;
  refreshTokens(r: Promise<LifecycleTokens>): void;
  removeTokens(): void;
}
