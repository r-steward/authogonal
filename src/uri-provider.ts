/**
 * Provides the uri for API authentication
 */
export interface AuthenticationUriProvider {
  authenticateUri: string;
}

/**
 * Default implementation that provides combined host and uri path
 */
export class DefaultAuthenticationUriProvider implements AuthenticationUriProvider {
  private readonly hostUri: string;
  private readonly uriPath: string;
  constructor(hostUri: string, uriPath: string) {
    this.hostUri = hostUri;
    this.uriPath = uriPath;
  }
  public get authenticateUri(): string {
    return this.hostUri + this.uriPath;
  }
}
