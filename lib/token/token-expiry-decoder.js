"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenExpiryDecoderStringSeparated = void 0;
const moment_1 = __importDefault(require("moment"));
const buffer_1 = require("buffer");
const logging_facade_1 = require("logging-facade");
const LOGGER = logging_facade_1.LogFactory.getLogger('TokenExpiryDecoderStringSeparated');
/**
 * Decodes base64 tokens comprised of <key><SEPARATOR><token><SEPARATOR><expiry>
 */
class TokenExpiryDecoderStringSeparated {
    constructor(separator) {
        this._separator = separator;
    }
    decode(token) {
        const expiry = token === null || token === void 0 ? void 0 : token.split(this._separator)[2];
        try {
            const expire = expiry == null ? 0 : buffer_1.Buffer.from(expiry, 'base64').readDoubleBE(0);
            return expiry == null ? null : moment_1.default.unix(expire).toDate();
        }
        catch (e) {
            LOGGER.warn('Error decoding token', e);
            return null;
        }
    }
}
exports.TokenExpiryDecoderStringSeparated = TokenExpiryDecoderStringSeparated;
