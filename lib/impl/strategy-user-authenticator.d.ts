import { UserAuthenticator } from '../user-authenticator';
import { UserCredentials, LogoutInfo } from '../user-authentication';
export declare class StrategyUserAuthenticator<U> implements UserAuthenticator<U> {
    private readonly strategyMap;
    constructor(strategyMap: Map<string, UserAuthenticator<U>>);
    authenticate(userCredentials: UserCredentials): Promise<U>;
    logout(logoutInfo: LogoutInfo): Promise<void>;
}
