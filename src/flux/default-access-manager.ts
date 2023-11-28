import { LogFactory } from 'logging-facade';
import { TokenAndTypeStatus, TokenManager } from '../token/token-manager';
import { AuthenticatorResponse, SUCCESS, UserAuthenticator, UserCredentials, createTokenCredentials } from '../user/user-authenticator';
import { AccessManager, LogoutCallback, ManualLoginCallback, RefreshLoginCallback, SilentLoginCallback } from './access-manager';
import * as AuthActions from './flux-actions';

const LOGGER = LogFactory.getLogger('DefaultAccessManager');

/**
 * Access manager that uses ARR token model
 */
export class DefaultAccessManager<U> implements AccessManager<U> {
    private silentLoginInProgress: Promise<boolean>;
    private manualLoginInProgress: Promise<boolean>;
    private eventCallback: RefreshLoginCallback;
    private intervalId: any;

    constructor(
        private readonly userAuthenticator: UserAuthenticator<U>,
        private readonly tokenManager: TokenManager,
        private readonly refreshCheckInterval: number = 60_000
    ) {
        this.eventCallback = (e) => { LOGGER.error(`No callback set for refresh timer event <${e.type}> - tokens will not refresh silently`) };
    }

    setRefreshLoginEventCallback(eventCallback: RefreshLoginCallback) {
        // set callback and clear interval if exists
        this.eventCallback = eventCallback;
        // start if already have tokens
        if (this.tokenManager.hasTokens) {
            this.startTimer();
        }
    }

    silentLogin(eventCallback: SilentLoginCallback<U>): Promise<boolean> {
        if (this.silentLoginInProgress == null) {
            this.silentLoginInProgress = this._doSilentLogin(eventCallback)
                .finally(() => {
                    this.silentLoginInProgress = null;
                });
        }
        return this.silentLoginInProgress;
    }

    manualLogin(credentials: UserCredentials, eventCallback: ManualLoginCallback<U>): Promise<boolean> {
        if (this.manualLoginInProgress == null) {
            this.manualLoginInProgress = this._doManualLogin(credentials, eventCallback)
                .finally(() => {
                    this.manualLoginInProgress = null;
                });
        }
        return this.manualLoginInProgress;
    }

    async onUnauthorized(eventCallback: SilentLoginCallback<U>): Promise<boolean> {
        return await this.silentLogin(eventCallback);
    }

    async onAccessExpired(eventCallback: SilentLoginCallback<U>): Promise<boolean> {
        return await this.silentLogin(eventCallback);
    }

    async logout(eventCallback: LogoutCallback): Promise<void> {
        await Promise.allSettled([this.silentLoginInProgress, this.manualLoginInProgress]);
        this.tokenManager.removeTokens();
        this.stopTimer();
        eventCallback(AuthActions.loggedOut);
    }

    private async _doManualLogin(credentials: UserCredentials, eventCallback: ManualLoginCallback<U>) {
        // create promise to authenticate which other actions will be based on
        const authenticatingPromise = new Promise<AuthenticatorResponse<U>>((resolve) => {
            setTimeout(() => {
                eventCallback(AuthActions.requestedManualLogin(credentials));
                this.userAuthenticator.authenticate(credentials).then(resolve);
            }, 0);
        });
        // block the token manager until the refresh is completed
        this.tokenManager.refreshTokens(authenticatingPromise.then(auth => auth.type === SUCCESS ? auth.tokens : null));
        // send events based on the outcome once tokens have been updated
        return authenticatingPromise.then(auth => {
            const isSuccess = auth.type === SUCCESS;
            if (isSuccess) {
                this.startTimer();
                eventCallback(AuthActions.manualLoginSuccess(auth.user));
            } else {
                this.stopTimer();
                eventCallback(AuthActions.manualLoginFailure(auth.error));
            }
            return isSuccess;
        });
    }

    private async _doSilentLogin(eventCallback: SilentLoginCallback<U>) {
        const { refreshTokenStatus, rememberMeTokenStatus } = this.tokenManager.getTokensForRefresh();
        // Do not attempt if both tokens already expired
        if (refreshTokenStatus.isExpired && rememberMeTokenStatus.isExpired) {
            if (LOGGER.isDebugEnabled()) {
                LOGGER.debug(`No available tokens for silent login ${JSON.stringify(refreshTokenStatus)} ${JSON.stringify(rememberMeTokenStatus)}`);
            }
            eventCallback(AuthActions.silentLoginFailure('no tokens/tokens expired'));
            return false;
        }
        // try refresh or remember me token refreshes
        const authenticatingPromise = new Promise<AuthenticatorResponse<U>>((resolve) => {
            setTimeout(async () => {
                if (!await this._attemptTokenLogin(refreshTokenStatus, eventCallback, resolve, false)) {
                    await this._attemptTokenLogin(rememberMeTokenStatus, eventCallback, resolve, true)
                }
            }, 0);
        });
        // block the token manager until the refresh is completed
        this.tokenManager.refreshTokens(authenticatingPromise.then(auth => auth.type === SUCCESS ? auth.tokens : null));
        // send events based on the outcome once tokens have been updated
        return authenticatingPromise.then(auth => {
            const isSuccess = auth.type === SUCCESS;
            if (isSuccess) {
                this.startTimer();
                eventCallback(AuthActions.silentLoginSuccess(auth.user));
            } else {
                this.stopTimer();
                eventCallback(AuthActions.silentLoginFailure(auth.error));
            }
            return isSuccess;
        });
    }

    private async _attemptTokenLogin(tokenTypeStatus: TokenAndTypeStatus, eventCallback: SilentLoginCallback<U>, resolve: (value: AuthenticatorResponse<U> | PromiseLike<AuthenticatorResponse<U>>) => void, resolveFailure: boolean) {
        if (!tokenTypeStatus.isExpired) {
            if (LOGGER.isDebugEnabled()) {
                LOGGER.debug(`Attempting login with <${tokenTypeStatus.type}> token`);
            }
            const credentials = createTokenCredentials({ type: tokenTypeStatus.type, token: tokenTypeStatus.token });
            eventCallback(AuthActions.requestedSilentLogin(credentials));
            const auth = await this.userAuthenticator.authenticate(credentials);
            if (auth.type === SUCCESS || resolveFailure) {
                resolve(auth);
            }
            return auth.type === SUCCESS;
        }
        return false;
    }

    private startTimer() {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug(`Starting refresh timer at <${this.refreshCheckInterval}> ms intervals`);
        }
        clearInterval(this.intervalId);
        const limit = this.refreshCheckInterval + 30_000;
        this.intervalId = setInterval(async () => {
            if (this.tokenManager.hasTokens) {
                const headroom = await this.tokenManager.accessTokenRemaining();
                if (headroom < limit) {
                    this.eventCallback(AuthActions.refreshSilentLogin);
                }
            }
        }, this.refreshCheckInterval).unref();
    }

    private stopTimer() {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug(`Stopping token refresh timer <${this.intervalId}>`);
        }
        clearInterval(this.intervalId);
    }

}
