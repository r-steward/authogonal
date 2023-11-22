export enum TokenType {
  AccessToken,
  RefreshToken,
  RememberMeToken,
}

export interface TokenAndType {
  token: string;
  type: TokenType;
}

export interface TokenAndTypeStatus extends TokenAndType {
  isExpired: boolean;
}

export interface AccessTokenResponse {
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
  authorizationToken(): string | Promise<string>;
}

/**
 * Interface to authorization tokens
 */
export interface TokenManager {
  getToken(type: TokenType): TokenAndTypeStatus | Promise<TokenAndTypeStatus>;
  removeTokens(): void;
  setToken(t: TokenAndType): void;
  setTokenFromResponse(r: AccessTokenResponse): void;
}
