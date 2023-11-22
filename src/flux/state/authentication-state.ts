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
