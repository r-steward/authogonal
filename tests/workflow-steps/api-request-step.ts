import { MockRequestLike, ResponseLike, WorkflowTestContext, createMockRequest } from "../test-utils";

export const testSuccessfulRequestEnrichment = async <TUser>(
    context: WorkflowTestContext<TUser, MockRequestLike>,
    expectedToken: string
) => {

    const requestMocker = createMockRequest(Promise.resolve<ResponseLike>({ status: 200 }));
    const enricher = context.accessManager.requestEnricher;
    // act
    const request = await enricher.authorizeRequest(requestMocker);
    const response = await request.request();
    // assert
    expect(requestMocker.set).toHaveBeenCalledTimes(1);
    expect(requestMocker.set).toHaveBeenCalledWith('Authorization', expectedToken);
    expect(response.status).toBe(200);
};


export const testRefresh = async <TUSer, TRequest>(
    context: WorkflowTestContext<TUSer, TRequest>,
    acceesExpiredDate: Date,
    refreshExpiredDate: Date,
) => {

    // 
    await jest.advanceTimersToNextTimerAsync();
    // token checked, but no calls made
    expect(context.tokenRemainingSpy).toHaveBeenCalledTimes(1);
    expect(context.mockServices.loginWithRefreshToken).toHaveBeenCalledTimes(context.callCounts.loginWithRefreshToken);
    expect(context.mockEventCallback).toHaveBeenCalledTimes(context.callCounts.eventCallback);

    // access token expired - so login with refresh token
    context.currentDate = acceesExpiredDate;
    context.callCounts.loginWithRefreshToken += 1;
    context.callCounts.eventCallback += 3;
    await jest.advanceTimersToNextTimerAsync();
    expect(context.tokenRemainingSpy).toHaveBeenCalledTimes(2);
    expect(context.mockServices.loginWithRefreshToken).toHaveBeenCalledTimes(context.callCounts.loginWithRefreshToken);
    expect(context.mockEventCallback).toHaveBeenCalledTimes(context.callCounts.eventCallback);

    // refresh token expired - so login with remember me token
    context.currentDate = refreshExpiredDate;
    context.callCounts.loginWithRememberMeToken += 1;
    context.callCounts.eventCallback += 3;
    await jest.advanceTimersToNextTimerAsync();
    expect(context.tokenRemainingSpy).toHaveBeenCalledTimes(3);
    expect(context.mockServices.loginWithRememberMeToken).toHaveBeenCalledTimes(context.callCounts.loginWithRememberMeToken);
    expect(context.mockEventCallback).toHaveBeenCalledTimes(context.callCounts.eventCallback);

};
