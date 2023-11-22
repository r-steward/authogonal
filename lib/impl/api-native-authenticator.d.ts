import { UserAuthenticator } from '../user-authenticator';
import { UserCredentials, LogoutInfo } from '../user-authentication';
import { AuthUserService } from '../auth-service';
import { TokenManager } from '../token';
export declare class ApiNativeAuthenticator<U> implements UserAuthenticator<U> {
    private _userService;
    private _tokenManager;
    private _loginCredentialType;
    constructor(userService: AuthUserService<U>, tokenManager: TokenManager, loginCredentialType: string);
    logout(logoutInfo: LogoutInfo): Promise<void>;
    authenticate(userCredentials: UserCredentials): Promise<U>;
}
