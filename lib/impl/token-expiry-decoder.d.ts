import { TokenExpiryDecoder } from '../token';
export declare class TokenExpiryDecoderStringSeparated implements TokenExpiryDecoder {
    private readonly _separator;
    constructor(separator: string);
    decode(token: string): Date;
}
