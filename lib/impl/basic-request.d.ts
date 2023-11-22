import { RequestAuthenticator } from '../request-authenticator';
interface RequestLike {
    auth(user: string, pwd: string, options: {
        type: string;
    }): this;
}
/**
 * Basic request authenticator
 * Updates a request with basic auth info from user authentication object
 */
export declare class BasicRequestAuthenticator<R extends RequestLike> implements RequestAuthenticator<R> {
    private readonly _userId;
    private readonly _password;
    constructor(userId: string, password: string);
    authorizeRequest(request: R): Promise<R>;
}
export {};
