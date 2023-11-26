import moment from 'moment';
import { LogBindingManager, ConsoleBinding } from 'logging-facade';
import { LoginCredentials, baseState, handleAuthAction } from '../src/';
import { EventCallbackStub, ServiceStub, createTestContext } from './test-utils';
import { testSuccesfulLogin, testUnsuccesfulLogin } from './workflow-steps/login-step';
import { testSuccesfulSilentLogin } from './workflow-steps/silent-login-step';

LogBindingManager.registerBinding(ConsoleBinding);

describe('Test Request Authenticator', () => {

    // test types
    interface TestUser {
        username: string;
    }
    // test user info
    const testUserInstance: TestUser = { username: 'testUser' };
    const testUserPassword = 'testPassword';
    const tokenDate_Feb_1_1400 = 'QdeNYRgAAAA=';
    const Feb_1_1420 = moment(Date.UTC(2020, 1, 1, 14, 20)).toDate();

    test('Test Silent Login Workflow', async () => {
        // arrange
        const context = createTestContext();
        context.currentDate = Feb_1_1420;
        const storedAccessToken = `access.token.${tokenDate_Feb_1_1400}`;
        const storedRefreshToken = `refresh.token.${tokenDate_Feb_1_1400}`;
        const storedRemembderMeToken = `remember.token.${tokenDate_Feb_1_1400}`;
        const onLoginAccessToken = `access.token.${tokenDate_Feb_1_1400}`;
        const onLoginRefreshToken = `refresh.token.${tokenDate_Feb_1_1400}`;
        const onLoginRemembderMeToken = `remember.token.${tokenDate_Feb_1_1400}`;

        context.serviceStub.addUser(testUserInstance.username, testUserPassword, testUserInstance, { refreshToken: storedRefreshToken, rememberMeToken: storedRemembderMeToken });
        context.serviceStub.serverSideTokens = { accessToken: onLoginAccessToken, refreshToken: onLoginRefreshToken, rememberMeToken: onLoginRemembderMeToken };
        context.tokenStorage.accessToken.setToken(storedAccessToken);
        context.tokenStorage.refreshToken.setToken(storedRefreshToken);
        context.tokenStorage.rememberMeToken.setToken(storedRemembderMeToken);
        // Login
        await testSuccesfulSilentLogin(context, storedRefreshToken, testUserInstance, onLoginAccessToken)
        // Send Request

        // 
    });

    test('Test Login Succeed', async () => {
        // arrange
        const onLoginAccessToken = `access.token.${tokenDate_Feb_1_1400}`;
        const onLoginRefreshToken = `refresh.token.${tokenDate_Feb_1_1400}`;
        const onLoginRemembderMeToken = `remember.token.${tokenDate_Feb_1_1400}`;
        const context = createTestContext();
        context.currentDate = Feb_1_1420;
        context.serviceStub.addUser(testUserInstance.username, testUserPassword, testUserInstance);
        context.serviceStub.serverSideTokens = { accessToken: onLoginAccessToken, refreshToken: onLoginRefreshToken, rememberMeToken: onLoginRemembderMeToken };

        // Login
        const loginData = { userId: 'testUser', password: 'testPassword', remember: true };
        await testSuccesfulLogin(context, loginData, testUserInstance, onLoginAccessToken);

        // Send Request

        // 
    });

    test('Test Login Failure', async () => {
        // arrange
        const context = createTestContext();
        context.currentDate = Feb_1_1420;
        context.serviceStub.addUser(testUserInstance.username, testUserPassword, testUserInstance);
        // act and assert
        // login
        const credentials: LoginCredentials = { userId: 'unknown', password: 'password', remember: false };
        await testUnsuccesfulLogin(context, credentials);
    });
})