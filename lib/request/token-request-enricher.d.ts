import { RequestEnricher } from './request-enricher';
import { TokenProvider } from '../token/token-manager';
interface RequestLike {
    set(field: string, val: string): this;
}
/**
 * Bespoke request enricher that adds an authorization token to the request header
 */
export declare class TokenRequestEnricher<R extends RequestLike> implements RequestEnricher<R> {
    private _tokenProvider;
    constructor(tokenProvider: TokenProvider);
    authorizeRequest(request: R): Promise<R>;
}
export declare function setAuthorizationHeader<R extends RequestLike>(request: R, value: string): R;
export {};
