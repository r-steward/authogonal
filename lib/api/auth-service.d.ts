import { AccessTokenResponse } from '../token/token-manager';
/**
 * API service to perform login/logout/token refreshes from back end
 */
export interface TokenLoginService {
    loginWithRefreshToken(refreshToken: string): Promise<AccessTokenResponse>;
    loginWithRememberMeToken(rememberMeToken: string): Promise<AccessTokenResponse>;
}
export interface PasswordLoginService {
    loginWithUserId(username: string, password: string, remember: boolean): Promise<AccessTokenResponse>;
}
/**
 * get specific user details
 */
export interface AuthUserService<U> {
    getUserDetails(accessToken: string): Promise<U>;
}
