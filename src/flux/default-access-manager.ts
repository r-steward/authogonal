import * as AuthActions from './flux-actions';
import { TokenAndTypeStatus, TokenManager, TokenType } from '../token/token-manager';
import { SUCCESS, UserAuthenticator, UserCredentials, createTokenCredentials } from '../user/user-authenticator';
import { AccessManager, ManualLoginCallback, SilentLoginCallback } from './access-manager';
import { LogFactory } from 'logging-facade';

const LOGGER = LogFactory.getLogger('DefaultAccessManager');

/**
 * Access manager that uses ARR token model
 */
export class DefaultAccessManager<U> implements AccessManager<U> {
    private silentLoginInProgress: Promise<boolean>;

    constructor(
        private readonly userAuthenticator: UserAuthenticator<U>,
        private readonly tokenManager: TokenManager
    ) { }

    silentLogin(eventCallback: SilentLoginCallback<U>): Promise<boolean> {
        if (this.silentLoginInProgress == null) {
            this.silentLoginInProgress = this._doSilentLogin(eventCallback)
                .finally(() => {
                    this.silentLoginInProgress = null
                });
        }
        return this.silentLoginInProgress;
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

    async onUnauthorized(eventCallback: SilentLoginCallback<U>): Promise<boolean> {
        return await this.silentLogin(eventCallback);
    }

    async onAccessExpired(eventCallback: SilentLoginCallback<U>): Promise<boolean> {
        return await this.silentLogin(eventCallback);
    }

    private async _doSilentLogin(eventCallback: SilentLoginCallback<U>) {
        const refreshTokenStatus = await this.tokenManager.getToken(TokenType.RefreshToken);
        const rememberMeTokenStatus = await this.tokenManager.getToken(TokenType.RememberMeToken);
        if (refreshTokenStatus.isExpired && rememberMeTokenStatus.isExpired) {
            if (LOGGER.isDebugEnabled()) {
                LOGGER.debug(`No available tokens for silent login ${JSON.stringify(refreshTokenStatus)} ${JSON.stringify(rememberMeTokenStatus)}`);
            }
            eventCallback(AuthActions.silentLoginFailure('no tokens/tokens expired'));
            return false;
        }
        if (await this._attemptTokenLogin(refreshTokenStatus, eventCallback) ||
            await this._attemptTokenLogin(rememberMeTokenStatus, eventCallback)) {
            return true;
        }
        eventCallback(AuthActions.silentLoginFailure('no tokens/tokens expired'));
        return false;
    }

    private async _attemptTokenLogin(tokenTypeStatus: TokenAndTypeStatus, eventCallback: SilentLoginCallback<U>) {
        if (!tokenTypeStatus.isExpired) {
            if (LOGGER.isDebugEnabled()) {
                LOGGER.debug(`Attempting login with <${tokenTypeStatus.type}> token`);
            }
            const credentials = createTokenCredentials({ type: tokenTypeStatus.type, token: tokenTypeStatus.token });
            eventCallback(AuthActions.requestedSilentLogin(credentials));
            const auth = await this.userAuthenticator.authenticate(credentials);
            if (auth.type === SUCCESS) {
                this.tokenManager.setTokenFromResponse(auth.tokens);
                eventCallback(AuthActions.silentLoginSuccess(auth.user));
                return true;
            }
        }
        return false;
    }
}
