
import * as AuthActions from "./flux-actions";
import { TokenManager, TokenType } from "../token/token-manager";
import { SUCCESS, UserAuthenticator, UserCredentials, createTokenCredentials } from "../user/user-authenticator";
import { AccessManager, ManualLoginCallback, SilentLoginCallback } from "./access-manager";

/**
 * Access manager that uses ARR token model 
 */
export class DefaultAccessManager<U> implements AccessManager<U> {
    constructor(
        private userAuthenticator: UserAuthenticator<U>,
        private tokenManager: TokenManager,
    ) {
    }

    async silentLogin(eventCallback: SilentLoginCallback<U>) {
        const refreshTokenStatus = await this.tokenManager.getToken(TokenType.RefreshToken);
        const rememberMeTokenStatus = await this.tokenManager.getToken(TokenType.RememberMeToken);
        if (refreshTokenStatus.isExpired || rememberMeTokenStatus.isExpired) {
            eventCallback(AuthActions.silentLoginFailure('no tokens/tokens expired'));
            return false;
        }
        if (!refreshTokenStatus.isExpired) {
            // TODO remove isExpired from following call
            const credentials = createTokenCredentials(refreshTokenStatus);
            eventCallback(AuthActions.requestedSilentLogin(credentials));
            const auth = await this.userAuthenticator.authenticate(credentials);
            if (auth.type === SUCCESS) {
                this.tokenManager.setTokenFromResponse(auth.tokens);
                eventCallback(AuthActions.silentLoginSuccess(auth.user));
                return true;
            }
        }
        if (!rememberMeTokenStatus.isExpired) {
            // TODO remove isExpired from following call
            const credentials = createTokenCredentials(rememberMeTokenStatus);
            eventCallback(AuthActions.requestedSilentLogin(credentials));
            const auth = await this.userAuthenticator.authenticate(credentials);
            if (auth.type === SUCCESS) {
                this.tokenManager.setTokenFromResponse(auth.tokens);
                eventCallback(AuthActions.silentLoginSuccess(auth.user));
                return true;
            }
        }
        eventCallback(AuthActions.silentLoginFailure('no tokens/tokens expired'));
        return false;
    }

    async manualLogin(credentials: UserCredentials, eventCallback: ManualLoginCallback<U>) {
        eventCallback(AuthActions.requestedManualLogin(credentials));
        const auth = await this.userAuthenticator.authenticate(credentials);
        if (auth.type === SUCCESS) {
            this.tokenManager.setTokenFromResponse(auth.tokens);
            eventCallback(AuthActions.manualLoginSuccess(auth.user));
            return true;
        }
        this.tokenManager.removeTokens();
        eventCallback(AuthActions.manualLoginFailure(auth.error));
        return false;
    }

    async onUnauthorized(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }


}