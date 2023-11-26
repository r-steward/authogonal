import { AuthenticationState, LoginCredentials, MANUAL_LOGIN_FAILURE, MANUAL_LOGIN_SUCCESS, ManualLoginFailureAction, ManualLoginSuccessAction, REQUESTED_MANUAL_LOGIN, RequestedManualLoginAction, UserCredentials, createLoginCredentials } from "../../src";
import { ExpectedCallCounts, WorkflowTestContext } from "../test-utils";

export const testSuccesfulLogin = async <U>(
    context: WorkflowTestContext<U>,
    credentials: LoginCredentials,
    expectedUser: U,
    expectedToken: string
) => {
    const expectedCallCounts: ExpectedCallCounts = {
        loginWithUserId: 1,
        getUserDetails: 1,
        eventCallback: 2
    };
    const expecteCompletionEvent: ManualLoginSuccessAction<U> = {
        type: MANUAL_LOGIN_SUCCESS,
        authenticatedUser: expectedUser,
    }
    const expectedStateAfterSuccess: AuthenticationState<U> = {
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
        expecteCompletionEvent,
        expectedStateAfterSuccess
    );
};

export const testUnsuccesfulLogin = async <U>(
    context: WorkflowTestContext<U>,
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
    const expectedStateAfterSuccess: AuthenticationState<U> = {
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
        expecteCompletionEvent,
        expectedStateAfterSuccess
    );
};

export const testLoginAttempt = async <U>(
    context: WorkflowTestContext<U>,
    credentials: LoginCredentials,
    loginSuccess: boolean,
    expectedCallCounts: ExpectedCallCounts,
    expectedToken: string,
    expectedCompletionEvent: ManualLoginSuccessAction<U> | ManualLoginFailureAction,
    expectedStateOnCompletion: AuthenticationState<U>,
) => {
    // arrange
    const loginCredentials: UserCredentials = createLoginCredentials(credentials);
    const expectedManualLoginEvent: RequestedManualLoginAction = {
        type: REQUESTED_MANUAL_LOGIN,
        credentials: loginCredentials
    };
    const expectedStateAfterRequest: AuthenticationState<U> = {
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
    expect(context.mockEventCallback).toHaveBeenCalledWith<(ManualLoginSuccessAction<U> | ManualLoginFailureAction)[]>(expectedCompletionEvent);
    expect(context.eventCallbackStub.states[eventCallbackIndex + 1]).toStrictEqual(expectedStateOnCompletion);
};
