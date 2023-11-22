import { AuthenticatorResponse, UserAuthenticator, UserCredentials } from './user-authenticator';
import { AuthUserService, TokenLoginService } from '../api/auth-service';
export declare class TokenAuthenticator<U> implements UserAuthenticator<U> {
    private _userService;
    private _loginService;
    constructor(_userService: AuthUserService<U>, _loginService: TokenLoginService);
    authenticate(userCredentials: UserCredentials): Promise<AuthenticatorResponse<U>>;
}
