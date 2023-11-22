"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultAuthenticationUriProvider = void 0;
/**
 * Default implementation that provides combined host and uri path
 */
class DefaultAuthenticationUriProvider {
    constructor(hostUri, uriPath) {
        this.hostUri = hostUri;
        this.uriPath = uriPath;
    }
    get authenticateUri() {
        return this.hostUri + this.uriPath;
    }
}
exports.DefaultAuthenticationUriProvider = DefaultAuthenticationUriProvider;
