import { RequestAuthenticator } from '../request-authenticator';
import { TokenProvider } from '../token-provider';
interface RequestLike {
    set(field: string, val: string): this;
}
export declare class TokenRequestAuthenticator<R extends RequestLike> implements RequestAuthenticator<R> {
    private _tokenProvider;
    constructor(tokenProvider: TokenProvider);
    authorizeRequest(request: R): Promise<R>;
}
export declare function setAuthorizationHeader<R extends RequestLike>(request: R, value: string): R;
export {};
