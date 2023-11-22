export interface UserCredentials {
    credentialType: string;
    credential: any;
}
export interface LogInCredentials {
    userId: string;
    password: string;
    remember: boolean;
}
export declare type UserCredentialsProvider = () => UserCredentials;
export interface ServerCredentials {
    token: string;
}
export interface LogoutInfo {
    credentialType: string;
}
export interface AuthenticationState<U> {
    isAuthorized: boolean;
    authenticatedUser?: U;
    actionState: {
        isPendingLogin?: boolean;
        isPendingLogout?: boolean;
        loginFailed?: boolean;
        loginMessage?: string;
    };
}
