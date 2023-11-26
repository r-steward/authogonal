export interface AuthenticationState<U> {
    isAuthorized: boolean;
    authenticatedUser?: U | null;
    actionState: {
        isPendingLogin?: boolean;
        isPendingLogout?: boolean;
        loginFailed?: boolean;
        loginMessage?: string;
    };
}
