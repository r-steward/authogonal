import { UserCredentials, LogoutInfo } from '../user-authentication';
export interface AuthenticationActionCreator {
    performLogin(userCredentials: UserCredentials): Promise<void>;
    performLogout(logoutInfo: LogoutInfo): Promise<void>;
    invalidateAuthorization(): Promise<void>;
}
