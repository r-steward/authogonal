/**
 * Returns the authorization token for the current user
 */
export interface TokenProvider {
    authorizationToken(): string | Promise<string>;
}
