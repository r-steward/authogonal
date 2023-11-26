import { AccessManager, EventCallback } from "../flux";
import { ForbiddenCode, UnauthorizedCode } from "../util";
import { RequestEnricher } from "./request-enricher";

/**
 * Retry requests if auth token has expired and we can attempt to refresh it
 */
export class RetryAuthRequestEnricher<R, U> implements RequestEnricher<R> {
    private static readonly authRetryCount = 3;
    constructor(
        private readonly requestEnricher: RequestEnricher<R>,
        private readonly accessManager: AccessManager<U>,
        private readonly eventCallback: EventCallback<U>
    ) { }

    async authorizeRequest(request: R): Promise<R> {
        return this.authorizeRequestWithRetry(request, 0);
    }

    async authorizeRequestWithRetry(request: R, count: number): Promise<R> {
        try {
            return await this.requestEnricher.authorizeRequest(request);
        } catch (e) {
            if (this.shouldAttemptAuthorization(e, count++) && await this.accessManager.onUnauthorized(this.eventCallback)) {
                return await this.authorizeRequestWithRetry(request, count);
            }
            throw e;
        }
    }

    private shouldAttemptAuthorization(e: unknown, count: number) {
        const status = (e as any).status;
        return count < RetryAuthRequestEnricher.authRetryCount &&
            (status === UnauthorizedCode || status === ForbiddenCode);
    }

}