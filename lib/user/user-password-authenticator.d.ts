import { AuthenticatorResponse, UserAuthenticator, UserCredentials } from './user-authenticator';
import { AuthUserService, PasswordLoginService } from '../api/auth-service';
export declare class UserPasswordAuthenticator<U> implements UserAuthenticator<U> {
    private _userService;
    private _loginService;
    constructor(_userService: AuthUserService<U>, _loginService: PasswordLoginService);
    authenticate(userCredentials: UserCredentials): Promise<AuthenticatorResponse<U>>;
}
