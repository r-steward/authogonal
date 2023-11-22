import { AccessTokenResponse } from './token';
export interface AuthTokenService {
    loginWithUserId(username: string, password: string, remember: boolean): Promise<AccessTokenResponse>;
    logout(token: string): Promise<boolean>;
    refreshFromRefreshToken(refreshToken: string): Promise<AccessTokenResponse>;
    refreshFromRememberMeToken(rememberMeToken: string): Promise<AccessTokenResponse>;
}
export interface AuthUserService<U> extends AuthTokenService {
    getUserDetails(accessToken: string): Promise<U>;
}
