import { TokenManager } from '../token/token-manager';
import { UserAuthenticator, UserCredentials } from '../user/user-authenticator';
import { AccessManager, ManualLoginCallback, SilentLoginCallback } from './access-manager';
/**
 * Access manager that uses ARR token model
 */
export declare class DefaultAccessManager<U> implements AccessManager<U> {
    private userAuthenticator;
    private tokenManager;
    constructor(userAuthenticator: UserAuthenticator<U>, tokenManager: TokenManager);
    silentLogin(eventCallback: SilentLoginCallback<U>): Promise<boolean>;
    manualLogin(credentials: UserCredentials, eventCallback: ManualLoginCallback<U>): Promise<boolean>;
    onUnauthorized(): Promise<boolean>;
}
