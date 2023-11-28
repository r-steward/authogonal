import { AuthogonalActionCreator, UserCredentials, createLoginCredentials, newAccessManagerBuilder } from '../src';
import { MockRequestLike, ServiceStub, createMockEventCallback, createMockService } from './test-utils';

interface TestUser {
    username: string;
}

describe('Test Access Manager Builder', () => {
    const tokenDate_Feb_1_1400 = 'QdeNYRgAAAA=';

    test('Test default builder with mock services', async () => {
        // arrange
        const onLoginAccessToken = `access.token.${tokenDate_Feb_1_1400}`;
        const loginData = { userId: 'testUser', password: 'testPassword', remember: true };
        const loginCredentials: UserCredentials = createLoginCredentials(loginData);

        const serviceStub = new ServiceStub<TestUser>();
        serviceStub.addUser(loginData.userId, loginData.password, { username: loginData.userId });
        serviceStub.serverSideTokens = { accessToken: onLoginAccessToken, refreshToken: '', rememberMeToken: '' };
        const mockServices = createMockService<TestUser>(serviceStub);
        const mockEventCallback = createMockEventCallback();
        // act
        const accessManager = newAccessManagerBuilder<TestUser, MockRequestLike>()
            .setPasswordLoginService(mockServices)
            .setTokenLoginService(mockServices)
            .setUserService(mockServices)
            .build();
        const loggedIn = await accessManager.manualLogin(loginCredentials, mockEventCallback);
        // assert
        expect(loggedIn).toBe(true);
        expect(mockServices.loginWithUserId).toHaveBeenCalledTimes(1);
        expect(mockServices.loginWithUserId).toHaveBeenCalledWith(loginData.userId, loginData.password, loginData.remember);
        expect(mockServices.getUserDetails).toHaveBeenCalledTimes(1);
        expect(mockServices.getUserDetails).toHaveBeenCalledWith(onLoginAccessToken);
        expect(mockEventCallback).toHaveBeenCalledTimes(2);
    });

});

