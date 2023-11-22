import { UserCredentials, LogoutInfo } from './user-authentication';
/**
 * Authenticates a user with a specific credential (e.g. password, external SSO token)
 */
export interface UserAuthenticator<U> {
    authenticate(userCredentials: UserCredentials): Promise<U>;
    logout(logoutInfo: LogoutInfo): Promise<void>;
}
