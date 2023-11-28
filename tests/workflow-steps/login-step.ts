import { AuthenticationState, LoginCredentials, MANUAL_LOGIN_FAILURE, MANUAL_LOGIN_SUCCESS, ManualLoginFailureAction, ManualLoginSuccessAction, REQUESTED_MANUAL_LOGIN, RequestedManualLoginAction, UserCredentials, createLoginCredentials } from "../../src";
import { ExpectedCallCounts, WorkflowTestContext } from "../test-utils";

export const testSuccesfulLogin = async <TUser, TRequest>(
    context: WorkflowTestContext<TUser, TRequest>,
    credentials: LoginCredentials,
    expectedUser: TUser,
    expectedToken: string,
    expectedRefreshToken: string,
    expectedRememberMeToken: string
) => {
    const expectedCallCounts: ExpectedCallCounts = {
        loginWithUserId: 1,
        getUserDetails: 1,
        eventCallback: 2
    };
    const expecteCompletionEvent: ManualLoginSuccessAction<TUser> = {
        type: MANUAL_LOGIN_SUCCESS,
        authenticatedUser: expectedUser,
    }
    const expectedStateAfterSuccess: AuthenticationState<TUser> = {
        actionState: {
            isPendingLogin: false,
            isPendingLogout: false,
            loginFailed: false,
        },
        authenticatedUser: expectedUser,
        isAuthorized: true
    }
    await testLoginAttempt(
        context,
        credentials,
        true,
        expectedCallCounts,
        expectedToken,
        expectedRefreshToken,
        expectedRememberMeToken,
        expecteCompletionEvent,
        expectedStateAfterSuccess
    );
};

export const testUnsuccesfulLogin = async <TUser, TRequest>(
    context: WorkflowTestContext<TUser, TRequest>,
    credentials: LoginCredentials
) => {
    // expectations for login failure
    const expectedCallCounts: ExpectedCallCounts = {
        loginWithUserId: 1,
        getUserDetails: 0,
        eventCallback: 2
    };
    const expecteCompletionEvent: ManualLoginFailureAction = {
        type: MANUAL_LOGIN_FAILURE,
        failureReason: `Failed to login with ${credentials.userId}`
    }
    const expectedStateAfterSuccess: AuthenticationState<TUser> = {
        actionState: {
            isPendingLogin: false,
            isPendingLogout: false,
            loginFailed: true,
            loginMessage: `Failed to login with ${credentials.userId}`,
        },
        authenticatedUser: null,
        isAuthorized: false
    }
    // act
    await testLoginAttempt(
        context,
        credentials,
        false,
        expectedCallCounts,
        'NA',
        'NA',
        'NA',
        expecteCompletionEvent,
        expectedStateAfterSuccess
    );
};

export const testLoginAttempt = async <TUSer, TRequest>(
    context: WorkflowTestContext<TUSer, TRequest>,
    credentials: LoginCredentials,
    loginSuccess: boolean,
    expectedCallCounts: ExpectedCallCounts,
    expectedToken: string,
    expectedRefreshToken: string,
    expectedRememberMeToken: string,
    expectedCompletionEvent: ManualLoginSuccessAction<TUSer> | ManualLoginFailureAction,
    expectedStateOnCompletion: AuthenticationState<TUSer>,
) => {
    // arrange
    const loginCredentials: UserCredentials = createLoginCredentials(credentials);
    const expectedManualLoginEvent: RequestedManualLoginAction = {
        type: REQUESTED_MANUAL_LOGIN,
        credentials: loginCredentials
    };
    const expectedStateAfterRequest: AuthenticationState<TUSer> = {
        actionState: {
            isPendingLogin: true
        },
        isAuthorized: false
    };
    // act
    const loggedIn = await context.accessManager.manualLogin(loginCredentials, context.mockEventCallback);

    // assert
    const eventCallbackIndex = context.callCounts.eventCallback;
    context.callCounts.loginWithUserId += expectedCallCounts.loginWithUserId;
    context.callCounts.getUserDetails += expectedCallCounts.getUserDetails;
    context.callCounts.eventCallback += expectedCallCounts.eventCallback;

    // stored tokens
    if (loginSuccess) {
        expect(context.tokenStorage.accessToken.getToken()).toBe(expectedToken);
        expect(context.tokenStorage.refreshToken.getToken()).toBe(expectedRefreshToken);
        expect(context.tokenStorage.rememberMeToken.getToken()).toBe(expectedRememberMeToken);
    } else {
        expect(context.tokenStorage.accessToken.getToken()).toBe(undefined);
        expect(context.tokenStorage.refreshToken.getToken()).toBe(undefined);
        expect(context.tokenStorage.rememberMeToken.getToken()).toBe(undefined);
    }
    expect(loggedIn).toBe(loginSuccess);
    // service login call
    expect(context.mockServices.loginWithUserId).toHaveBeenCalledTimes(context.callCounts.loginWithUserId);
    if (expectedCallCounts.loginWithUserId > 0) {
        expect(context.mockServices.loginWithUserId).toHaveBeenCalledWith(credentials.userId, credentials.password, credentials.remember);
    }
    // get user call
    expect(context.mockServices.getUserDetails).toHaveBeenCalledTimes(context.callCounts.getUserDetails);
    if (expectedCallCounts.getUserDetails > 0) {
        expect(context.mockServices.getUserDetails).toHaveBeenCalledWith(expectedToken);
    }
    // flux events
    expect(context.mockEventCallback).toHaveBeenCalledTimes(context.callCounts.eventCallback);
    expect(context.mockEventCallback).toHaveBeenCalledWith<RequestedManualLoginAction[]>(expectedManualLoginEvent);
    expect(context.eventCallbackStub.states[eventCallbackIndex]).toStrictEqual(expectedStateAfterRequest);
    // Login was successful/failure
    expect(context.mockEventCallback).toHaveBeenCalledWith<(ManualLoginSuccessAction<TUSer> | ManualLoginFailureAction)[]>(expectedCompletionEvent);
    expect(context.eventCallbackStub.states[eventCallbackIndex + 1]).toStrictEqual(expectedStateOnCompletion);
};
