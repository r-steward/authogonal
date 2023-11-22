import moment from 'moment';
import { Buffer } from 'buffer';
import { LogFactory } from 'logging-facade';
import { TokenExpiryDecoder } from './token-manager';

const LOGGER = LogFactory.getLogger('TokenExpiryDecoderStringSeparated');

/**
 * Decodes base64 tokens comprised of <key><SEPARATOR><token><SEPARATOR><expiry>
 */
export class TokenExpiryDecoderStringSeparated implements TokenExpiryDecoder {
  private readonly _separator: string;

  constructor(separator: string) {
    this._separator = separator;
  }

  public decode(token: string): Date {
    const expiry = token?.split(this._separator)[2];
    try {
      const expire = expiry == null ? 0 : Buffer.from(expiry, 'base64').readDoubleBE(0);
      return expiry == null ? null : moment.unix(expire).toDate();
    } catch (e) {
      LOGGER.warn('Error decoding token', e);
      return null;
    }
  }
}
