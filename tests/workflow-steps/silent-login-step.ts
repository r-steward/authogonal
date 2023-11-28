import { AuthenticationState, REQUESTED_SILENT_LOGIN, RequestedSilentLoginAction, SILENT_LOGIN_SUCCESS, SilentLoginFailureAction, SilentLoginSuccessAction, TokenType, createTokenCredentials } from "../../src";
import { ExpectedSilentLoginCallCounts, WorkflowTestContext } from "../test-utils";

export const testSuccesfulSilentLogin = async <TUser, TRequest>(
    context: WorkflowTestContext<TUser, TRequest>,
    expectedLoginToken: string,
    expectedUser: TUser,
    expectedAccessToken: string,
    expectedRefreshToken: string,
    expectedRememberMeToken: string,
) => {
    // expectations for successful login
    const expectedCallCounts: ExpectedSilentLoginCallCounts = {
        loginWithRefreshToken: 1,
        getUserDetails: 1,
        eventCallback: 2
    };
    const expecteCompletionEvent: SilentLoginSuccessAction<TUser> = {
        type: SILENT_LOGIN_SUCCESS,
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
        true,
        expectedCallCounts,
        expectedLoginToken,
        expectedAccessToken,
        expectedRefreshToken,
        expectedRememberMeToken,
        expecteCompletionEvent,
        expectedStateAfterSuccess
    );
};

export const testLoginAttempt = async <TUser, TRequest>(
    context: WorkflowTestContext<TUser, TRequest>,
    loginSuccess: boolean,
    expectedCallCounts: ExpectedSilentLoginCallCounts,
    expectedLoginToken: string,
    expectedAccessToken: string,
    expectedRefreshToken: string,
    expectedRememberMeToken: string,
    expectedCompletionEvent: SilentLoginSuccessAction<TUser> | SilentLoginFailureAction,
    expectedStateOnCompletion: AuthenticationState<TUser>,
) => {
    // arrange
    const expectedCredentials = createTokenCredentials({ type: TokenType.RefreshToken, token: expectedLoginToken });
    const expectedLoginAction: RequestedSilentLoginAction = (
        {
            type: REQUESTED_SILENT_LOGIN,
            credentials: expectedCredentials
        });
    const expectedStateAfterRequest: AuthenticationState<TUser> = {
        actionState: {
            isPendingLogin: true
        },
        isAuthorized: false
    }
    // act
    const loggedIn = await context.accessManager.silentLogin(context.mockEventCallback);
    // assert
    if (loginSuccess) {
        expect(context.tokenStorage.accessToken.getToken()).toBe(expectedAccessToken);
        expect(context.tokenStorage.refreshToken.getToken()).toBe(expectedRefreshToken);
        expect(context.tokenStorage.rememberMeToken.getToken()).toBe(expectedRememberMeToken);
    } else {
        expect(context.tokenStorage.accessToken.getToken()).toBe(undefined);
        expect(context.tokenStorage.refreshToken.getToken()).toBe(undefined);
        expect(context.tokenStorage.rememberMeToken.getToken()).toBe(undefined);
    }

    const eventCallbackIndex = context.callCounts.eventCallback;
    context.callCounts.loginWithRefreshToken += expectedCallCounts.loginWithRefreshToken;
    context.callCounts.getUserDetails += expectedCallCounts.getUserDetails;
    context.callCounts.eventCallback += expectedCallCounts.eventCallback;

    expect(context.mockServices.loginWithRefreshToken).toHaveBeenCalledTimes(context.callCounts.loginWithRefreshToken);
    expect(context.mockServices.loginWithRefreshToken).toHaveBeenCalledWith(expectedLoginToken);
    expect(context.mockServices.getUserDetails).toHaveBeenCalledTimes(context.callCounts.getUserDetails);
    if (expectedCallCounts.getUserDetails > 0) {
        expect(context.mockServices.getUserDetails).toHaveBeenCalledWith(expectedAccessToken);
    }
    expect(context.mockEventCallback).toHaveBeenCalledWith<RequestedSilentLoginAction[]>(expectedLoginAction)
    expect(context.eventCallbackStub.states[eventCallbackIndex]).toStrictEqual(expectedStateAfterRequest);
    expect(context.mockEventCallback).toHaveBeenCalledWith<(SilentLoginSuccessAction<TUser> | SilentLoginFailureAction)[]>(expectedCompletionEvent);
    expect(context.eventCallbackStub.states[eventCallbackIndex + 1]).toStrictEqual(expectedStateOnCompletion);
    expect(context.mockEventCallback).toHaveBeenCalledTimes(context.callCounts.eventCallback);
    expect(loggedIn).toBe(loginSuccess);
    return loggedIn;

}