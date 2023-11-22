"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuthenticationUriProviderImpl {
    constructor(hostUri, uriPath) {
        this.hostUri = hostUri;
        this.uriPath = uriPath;
    }
    get authenticateUri() {
        return this.hostUri + this.uriPath;
    }
}
exports.AuthenticationUriProviderImpl = AuthenticationUriProviderImpl;
