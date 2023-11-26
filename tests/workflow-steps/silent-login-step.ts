import { AuthenticationState, REQUESTED_SILENT_LOGIN, RequestedSilentLoginAction, SILENT_LOGIN_SUCCESS, SilentLoginFailureAction, SilentLoginSuccessAction, TokenType, createTokenCredentials } from "../../src";
import { ExpectedSilentLoginCallCounts, WorkflowTestContext } from "../test-utils";

export const testSuccesfulSilentLogin = async <U>(
    context: WorkflowTestContext<U>,
    expectedLoginToken: string,
    expectedUser: U,
    expectedUserToken: string
) => {
    // expectations for successful login
    const expectedCallCounts: ExpectedSilentLoginCallCounts = {
        loginWithRefreshToken: 1,
        getUserDetails: 1,
        eventCallback: 2
    };
    const expecteCompletionEvent: SilentLoginSuccessAction<U> = {
        type: SILENT_LOGIN_SUCCESS,
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
        true,
        expectedCallCounts,
        expectedLoginToken,
        expectedUserToken,
        expecteCompletionEvent,
        expectedStateAfterSuccess
    );
};

export const testLoginAttempt = async <U>(
    context: WorkflowTestContext<U>,
    loginSuccess: boolean,
    expectedCallCounts: ExpectedSilentLoginCallCounts,
    expectedLoginToken: string,
    expectedUserToken: string,
    expectedCompletionEvent: SilentLoginSuccessAction<U> | SilentLoginFailureAction,
    expectedStateOnCompletion: AuthenticationState<U>,
) => {
    // arrange
    const expectedCredentials = createTokenCredentials({ type: TokenType.RefreshToken, token: expectedLoginToken });
    const expectedLoginAction: RequestedSilentLoginAction = (
        {
            type: REQUESTED_SILENT_LOGIN,
            credentials: expectedCredentials
        });
    const expectedStateAfterRequest: AuthenticationState<U> = {
        actionState: {
            isPendingLogin: true
        },
        isAuthorized: false
    }
    // act
    console.log('About to do silent login');
    const loggedInP1 = context.accessManager.silentLogin(context.mockEventCallback);
    const loggedInP2 = context.accessManager.silentLogin(context.mockEventCallback);
    const loggedInP3 = context.accessManager.silentLogin(context.mockEventCallback);
    loggedInP1.then(i => console.log('Resolve p1'));
    loggedInP2.then(i => console.log('Resolve p2'));
    loggedInP3.then(i => console.log('Resolve p3'));
    console.log('now wait for silent login');
    const loggedIn = await loggedInP1;
    console.log('Done silent login with', loggedIn);
    // assert
    const eventCallbackIndex = context.callCounts.eventCallback;
    context.callCounts.loginWithRefreshToken += expectedCallCounts.loginWithRefreshToken;
    context.callCounts.getUserDetails += expectedCallCounts.getUserDetails;
    context.callCounts.eventCallback += expectedCallCounts.eventCallback;

    expect(context.mockServices.loginWithRefreshToken).toHaveBeenCalledTimes(context.callCounts.loginWithRefreshToken);
    expect(context.mockServices.loginWithRefreshToken).toHaveBeenCalledWith(expectedLoginToken);
    expect(context.mockServices.getUserDetails).toHaveBeenCalledTimes(context.callCounts.getUserDetails);
    if (expectedCallCounts.getUserDetails > 0) {
        expect(context.mockServices.getUserDetails).toHaveBeenCalledWith(expectedUserToken);
    }
    expect(context.mockEventCallback).toHaveBeenCalledWith<RequestedSilentLoginAction[]>(expectedLoginAction)
    expect(context.eventCallbackStub.states[eventCallbackIndex]).toStrictEqual(expectedStateAfterRequest);
    expect(context.mockEventCallback).toHaveBeenCalledWith<(SilentLoginSuccessAction<U> | SilentLoginFailureAction)[]>(expectedCompletionEvent);
    expect(context.eventCallbackStub.states[eventCallbackIndex + 1]).toStrictEqual(expectedStateOnCompletion);
    expect(context.mockEventCallback).toHaveBeenCalledTimes(context.callCounts.eventCallback);
    expect(loggedIn).toBe(loginSuccess);
    return loggedIn;

}