import { TokenExpiryDecoder } from './token-manager';
/**
 * Decodes base64 tokens comprised of <key><SEPARATOR><token><SEPARATOR><expiry>
 */
export declare class TokenExpiryDecoderStringSeparated implements TokenExpiryDecoder {
    private readonly _separator;
    constructor(separator: string);
    decode(token: string): Date;
}
