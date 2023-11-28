import { AccessManager, SilentLoginCallback } from "../flux";
import { TokenManager, TokenProvider, TokenType } from "./token-manager";

/**
 * Token provider that checks the expiry of the token and refreshes if expired
 */
export class RefreshingTokenProvider<U> implements TokenProvider {

    constructor(
        private readonly tokenManager: TokenManager,
        private readonly accessManager: AccessManager<U>,
        private readonly eventCallback: SilentLoginCallback<U>
    ) { }

    async authorizationToken(): Promise<string> {
        let accessToken = await this.tokenManager.getToken(TokenType.AccessToken);
        if (accessToken.isExpired && await this.accessManager.onAccessExpired(this.eventCallback)) {
            accessToken = await this.tokenManager.getToken(TokenType.AccessToken);
        }
        return accessToken.token;
    }

}