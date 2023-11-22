import { AuthenticationUriProvider } from '../uri-provider';
export declare class AuthenticationUriProviderImpl implements AuthenticationUriProvider {
    private readonly hostUri;
    private readonly uriPath;
    constructor(hostUri: string, uriPath: string);
    get authenticateUri(): string;
}
