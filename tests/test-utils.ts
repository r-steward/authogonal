import { LogFactory } from 'logging-facade';
import { AccessManager, LifecycleTokens, AllTokenStorage, AuthenticationAction, AuthenticationState, DateProvider, DefaultAccessManager, DefaultTokenManager, EventCallback, LOGIN, MemoryStorage, StateHandler, StrategyUserAuthenticator, TOKEN, TokenAuthenticator, TokenExpiryDecoderStringSeparated, TokenManager, UserAuthenticator, UserPasswordAuthenticator, baseState, createSuccessResponse, handleAuthAction, newAccessManagerBuilder } from '../src';
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

// Workflow context
export type WorkflowTestContext<U> = {
    serviceStub: ServiceStub<U>;
    eventCallbackStub: EventCallbackStub<U>;
    tokenManager: TokenManager;
    tokenStorage: AllTokenStorage;
    mockServices: PasswordLoginService & TokenLoginService & AuthUserService<U>;
    mockEventCallback: EventCallback<U>;
    accessManager: AccessManager<U>;
    callCounts: CallCounts<U>;
    currentDate: Date;
}

export function createTestContext<U>(): WorkflowTestContext<U> {
    let context: WorkflowTestContext<U> = null as unknown as WorkflowTestContext<U>;

    // services
    const serviceStub = new ServiceStub<U>();
    const mockServices = createMockService<U>(serviceStub);

    // access manager
    const tokenStorage: AllTokenStorage = {
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
    const accessManager = newAccessManagerBuilder<U>()
        .setPasswordLoginService(mockServices)
        .setTokenLoginService(mockServices)
        .setUserService(mockServices)
        .setTokenManager(tokenManager)
        .setDateProvider(new DateProviderMocker(() => context.currentDate))
        .build();

    // event callbacks
    const eventCallbackStub = new EventCallbackStub(handleAuthAction, baseState);
    const mockEventCallback = createMockEventCallback(eventCallbackStub);

    // create context
    context = {
        accessManager,
        tokenManager,
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
        loginWithUserId: jest.fn((username, password, remember): Promise<LifecycleTokens> => {
            return stub.loginWithUserId(username, password, remember);
        }),
        loginWithRefreshToken: jest.fn((refreshToken: string): Promise<LifecycleTokens> => {
            return stub.loginWithRefreshToken(refreshToken);
        }),
        loginWithRememberMeToken: jest.fn((rememberMeToken: string): Promise<LifecycleTokens> => {
            return stub.loginWithRememberMeToken(rememberMeToken);
        }),
        getUserDetails: jest.fn((accessToken: string): Promise<U> => {
            return stub.getUserDetails(accessToken);
        })
    }));
    return new ServiceMocker(serviceStub);
};

/**
 * Mocks the event callback which receives flux events from the access manager calls
 */
export const createMockEventCallback = <U>(stub?: EventCallbackStub<U>) => {
    return jest.fn((e: AuthenticationAction<U>) => {
        stub?.onCallback(e);
    });
};

export const DateProviderMocker = jest.fn<DateProvider, [() => Date]>((date: () => Date) => ({
    getDateTime: jest.fn(date),
}));

export interface MockRequestLike {
    set(field: string, val: string): this;
    request(): Promise<ResponseLike>;
}
export interface ResponseLike {
    status: number;
}

export const createMockRequest = (response: Promise<ResponseLike>) => {
    let requestMocker: MockRequestLike;
    const RequestMocker = jest.fn<MockRequestLike, []>(() => ({
        set: jest.fn(() => requestMocker),
        request: jest.fn(() => response),
    }));
    requestMocker = new RequestMocker();
    return requestMocker;
};

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

    loginWithRefreshToken(refreshToken: string): Promise<LifecycleTokens> {
        return this.loginWithToken(refreshToken, i => i.refreshToken === refreshToken);
    }

    loginWithRememberMeToken(rememberMeToken: string): Promise<LifecycleTokens> {
        return this.loginWithToken(rememberMeToken, i => i.rememberMeToken === rememberMeToken);
    }

    loginWithUserId(username: string, password: string, remember: boolean): Promise<LifecycleTokens> {
        const entry = this.userMap.get(username);
        if (entry?.password === password) {
            entry.remember = remember;
            entry.accessToken = this.serverSideTokens.accessToken;
            entry.refreshToken = this.serverSideTokens.refreshToken;
            entry.rememberMeToken = remember ? this.serverSideTokens.rememberMeToken : undefined;
        }
        return this.getResponse(username, entry?.password === password ? entry : undefined);
    }

    private loginWithToken(name: string, predicate: (e: LoginEntry<U>) => boolean): Promise<LifecycleTokens> {
        const entry = Array.from(this.userMap.values()).find(predicate);
        if (entry) {
            entry.accessToken = this.serverSideTokens.accessToken;
            entry.refreshToken = this.serverSideTokens.refreshToken;
            entry.rememberMeToken = entry.remember ? this.serverSideTokens.rememberMeToken : undefined;
        }
        return this.getResponse(name, entry);
    }


    private getResponse(name: string, entry: LoginEntry<U> | undefined): Promise<LifecycleTokens> {
        if (!entry) {
            return Promise.reject(new Error(`Failed to login with ${name}`));
        }
        return Promise.resolve({ accessToken: entry!.accessToken!, refreshToken: entry!.refreshToken! });
    }

}

export class StubApiCall {
    public readonly fieldMap: Map<string, string> = new Map();

    set(field: string, val: string): this {
        this.fieldMap.set(field, val);
        return this;
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