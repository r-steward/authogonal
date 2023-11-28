import { LifecycleTokens } from '../token/token-manager';

/**
 * API service to perform login/logout/token refreshes from back end
 */
export interface TokenLoginService {
  loginWithRefreshToken(refreshToken: string): Promise<LifecycleTokens>;
  loginWithRememberMeToken(rememberMeToken: string): Promise<LifecycleTokens>;
}

export interface PasswordLoginService {
  loginWithUserId(username: string, password: string, remember: boolean): Promise<LifecycleTokens>;
}

/**
 * get specific user details
 */
export interface AuthUserService<U> {
  getUserDetails(accessToken: string): Promise<U>;
}
