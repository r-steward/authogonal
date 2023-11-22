/**
 * Provides the uri for API authentication
 */
export interface AuthenticationUriProvider {
    authenticateUri: string;
}
/**
 * Default implementation that provides combined host and uri path
 */
export declare class DefaultAuthenticationUriProvider implements AuthenticationUriProvider {
    private readonly hostUri;
    private readonly uriPath;
    constructor(hostUri: string, uriPath: string);
    get authenticateUri(): string;
}
