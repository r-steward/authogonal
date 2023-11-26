import { LogFactory } from 'logging-facade';
import { AccessManager, AccessTokenResponse, AuthenticationAction, AuthenticationState, DateProvider, DefaultAccessManager, DefaultTokenManager, EventCallback, LOGIN, MemoryStorage, StateHandler, StrategyUserAuthenticator, TOKEN, TokenAuthenticator, TokenExpiryDecoderStringSeparated, UserAuthenticator, UserPasswordAuthenticator, baseState, createSuccessResponse, handleAuthAction } from '../src';
import { AuthUserService, PasswordLoginService, TokenLoginService } from '../src/api/auth-service';
const LOGGER = LogFactory.getLogger('TestUtils');

export type CallCounts<U> = { eventCallback: number } &
    { [P in keyof PasswordLoginService]: number } &
    { [P in keyof TokenLoginService]: number } &
    { [P in keyof AuthUserService<U>]: number }
    ;

export type ExpectedCallCounts = {
    loginWithUserId: number;
    getUserDetails: number;
    eventCallback: number;
}

export type ExpectedSilentLoginCallCounts = {
    loginWithRefreshToken: number;
    getUserDetails: number;
    eventCallback: number;
}

export type TokenStorage = {
    accessToken: MemoryStorage;
    refreshToken: MemoryStorage;
    rememberMeToken: MemoryStorage;
}

// Workflow context
export type WorkflowTestContext<U> = {
    serviceStub: ServiceStub<U>;
    eventCallbackStub: EventCallbackStub<U>;
    tokenStorage: TokenStorage;
    mockServices: PasswordLoginService & TokenLoginService & AuthUserService<U>;
    mockEventCallback: EventCallback<U>;
    accessManager: AccessManager<U>;
    callCounts: CallCounts<U>;
    currentDate: Date;
}

export function createTestContext<U>(): WorkflowTestContext<U> {
    let context: WorkflowTestContext<U> = null as unknown as WorkflowTestContext<U>;
    const eventCallbackStub = new EventCallbackStub(handleAuthAction, baseState);
    const serviceStub = new ServiceStub<U>();
    const mockServices = createMockService<U>(serviceStub);
    const authenticator = new StrategyUserAuthenticator(new Map([
        [LOGIN, <UserAuthenticator<U>>new UserPasswordAuthenticator(mockServices, mockServices)],
        [TOKEN, <UserAuthenticator<U>>new TokenAuthenticator(mockServices, mockServices)]
    ]))
    const tokenStorage: TokenStorage = {
        accessToken: new MemoryStorage(),
        refreshToken: new MemoryStorage(),
        rememberMeToken: new MemoryStorage()
    }
    const tokenManager = new DefaultTokenManager(
        tokenStorage.accessToken,
        tokenStorage.refreshToken,
        tokenStorage.rememberMeToken,
        new TokenExpiryDecoderStringSeparated('.'),
        new DateProviderMocker(() => context.currentDate),
    );
    const mockEventCallback = createMockEventCallback(eventCallbackStub);
    const accessManager = new DefaultAccessManager(authenticator, tokenManager);
    context = {
        accessManager,
        eventCallbackStub,
        serviceStub,
        tokenStorage,
        mockServices,
        mockEventCallback,
        callCounts: {
            eventCallback: 0,
            getUserDetails: 0,
            loginWithRefreshToken: 0,
            loginWithRememberMeToken: 0,
            loginWithUserId: 0
        },
        currentDate: new Date()
    };
    return context;
}


// Mocks

/**
 * Mocks all of the backend service calls, with a stub to manipulate responses
 */
export const createMockService = <U>(serviceStub: ServiceStub<U>) => {
    const ServiceMocker = jest.fn<PasswordLoginService & TokenLoginService & AuthUserService<U>, [ServiceStub<U>]>((stub: ServiceStub<U>) => ({
        loginWithUserId: jest.fn((username, password, remember): Promise<AccessTokenResponse> => {
            return stub.loginWithUserId(username, password, remember);
        }),
        loginWithRefreshToken: jest.fn((refreshToken: string): Promise<AccessTokenResponse> => {
            return stub.loginWithRefreshToken(refreshToken);
        }),
        loginWithRememberMeToken: jest.fn((rememberMeToken: string): Promise<AccessTokenResponse> => {
            return stub.loginWithRememberMeToken(rememberMeToken);
        }),
        getUserDetails: jest.fn((accessToken: string): Promise<U> => {
            return stub.getUserDetails(accessToken);
        })
    }));
    return new ServiceMocker(serviceStub);
};

export const createMockEventCallback = <U>(stub: EventCallbackStub<U>) => {
    return jest.fn((e: AuthenticationAction<U>) => {
        stub.onCallback(e);
    });
};

export const DateProviderMocker = jest.fn<DateProvider, [() => Date]>((date: () => Date) => ({
    getDateTime: jest.fn(date),
}));

// Stubs

type TokenEntry = {
    accessToken: string;
    refreshToken: string;
    rememberMeToken: string;
}

type LoginEntry<U> = Partial<TokenEntry> & {
    user: U;
    password: string;
    remember: boolean;
}

/**
 * Stub object to behave like auth API
 */
export class ServiceStub<U> implements PasswordLoginService, TokenLoginService, AuthUserService<U> {
    public readonly userMap: Map<string, LoginEntry<U>> = new Map();
    public serverSideTokens: TokenEntry;

    constructor() {
    }

    getUserDetails(accessToken: string): Promise<U> {
        const entry = Array.from(this.userMap.values()).find(i => i.accessToken = accessToken);
        if (!entry) {
            Promise.reject(`ServiceStub: Failed to retrieve any user details for ${accessToken}`);
        }
        return Promise.resolve(entry!.user);
    }

    addUser(username: string, password: string, user: U, tokens: Partial<TokenEntry> | null = null) {
        this.userMap.set(username, { user, password, remember: false, ...tokens });
    }

    loginWithRefreshToken(refreshToken: string): Promise<AccessTokenResponse> {
        return this.loginWithToken(refreshToken, i => i.refreshToken === refreshToken);
    }

    loginWithRememberMeToken(rememberMeToken: string): Promise<AccessTokenResponse> {
        return this.loginWithToken(rememberMeToken, i => i.rememberMeToken === rememberMeToken);
    }

    loginWithUserId(username: string, password: string, remember: boolean): Promise<AccessTokenResponse> {
        const entry = this.userMap.get(username);
        if (entry?.password === password) {
            entry.remember = remember;
            entry.accessToken = this.serverSideTokens.accessToken;
            entry.refreshToken = this.serverSideTokens.refreshToken;
            entry.rememberMeToken = remember ? this.serverSideTokens.rememberMeToken : undefined;
        }
        return this.getResponse(username, entry?.password === password ? entry : undefined);
    }

    private loginWithToken(name: string, predicate: (e: LoginEntry<U>) => boolean): Promise<AccessTokenResponse> {
        const entry = Array.from(this.userMap.values()).find(predicate);
        if (entry) {
            entry.accessToken = this.serverSideTokens.accessToken;
            entry.refreshToken = this.serverSideTokens.refreshToken;
            entry.rememberMeToken = entry.remember ? this.serverSideTokens.rememberMeToken : undefined;
        }
        return this.getResponse(name, entry);
    }


    private getResponse(name: string, entry: LoginEntry<U> | undefined): Promise<AccessTokenResponse> {
        if (!entry) {
            return Promise.reject(new Error(`Failed to login with ${name}`));
        }
        return Promise.resolve({ accessToken: entry!.accessToken!, refreshToken: entry!.refreshToken! });
    }

}

/**
 * Stub to transform authentication state
 */
export class EventCallbackStub<U> {
    public readonly states: AuthenticationState<U>[] = [];

    constructor(
        private readonly handler: StateHandler<U>,
        public currentState: AuthenticationState<U>) { }

    onCallback(action: AuthenticationAction<U>) {
        LOGGER.debug(`Received callback action ${JSON.stringify(action)}`);
        this.currentState = this.handler(this.currentState, action);
        this.states.push(this.currentState);
    }
}