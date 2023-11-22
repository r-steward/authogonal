"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const fourspace_logger_ts_1 = require("fourspace-logger-ts");
const LOGGER = fourspace_logger_ts_1.LogFactory.getLogger('api-user-authenticator');
class TokenExpiryDecoderStringSeparated {
    constructor(separator) {
        this._separator = separator;
    }
    decode(token) {
        const expiry = token === null || token === void 0 ? void 0 : token.split(this._separator)[2];
        try {
            const expire = expiry == null ? 0 : Buffer.from(expiry, 'base64').readDoubleBE(0);
            return expiry == null ? null : moment_1.default.unix(expire).toDate();
        }
        catch (e) {
            LOGGER.warn('Error decoding token', e);
            return null;
        }
    }
}
exports.TokenExpiryDecoderStringSeparated = TokenExpiryDecoderStringSeparated;
