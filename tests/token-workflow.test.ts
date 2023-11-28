import { ConsoleBinding, LogBindingManager } from 'logging-facade';
import moment from 'moment';
import { LoginCredentials, TokenRequestEnricher } from '../src/';
import { MockRequestLike, ResponseLike, createMockRequest, createTestContext } from './test-utils';
import { testSuccesfulLogin, testUnsuccesfulLogin } from './workflow-steps/login-step';
import { testSuccesfulSilentLogin } from './workflow-steps/silent-login-step';
import { testRefresh, testSuccessfulRequestEnrichment } from './workflow-steps/api-request-step';

//LogBindingManager.registerBinding(ConsoleBinding);

describe('Test Request Authenticator', () => {

    beforeEach(() => jest.useFakeTimers({ advanceTimers: true }));
    afterEach(() => jest.useRealTimers());

    // test types
    interface TestUser {
        username: string;
    }
    // test user info
    const testUserInstance: TestUser = { username: 'testUser' };
    const testUserPassword = 'testPassword';
    const tokenDate_Feb_1_1400 = 'QdeNYRgAAAA=';
    const tokenDate_Feb_1_1700 = 'QdeNa6QAAAA=';
    const tokenDate_Feb_28_2300 = 'QdeWZtwAAAA=';

    const Feb_1_1340 = moment(Date.UTC(2020, 1, 1, 13, 40)).toDate();
    const Feb_1_1430 = moment(Date.UTC(2020, 1, 1, 14, 30)).toDate();
    const Feb_1_1800 = moment(Date.UTC(2020, 1, 1, 18, 0)).toDate();

    const storedAccessToken = `silentAccess.token.${tokenDate_Feb_1_1400}`;
    const storedRefreshToken = `silentRefresh.token.${tokenDate_Feb_1_1700}`;
    const storedRememberMeToken = `silentRemember.token.${tokenDate_Feb_28_2300}`;

    const onLoginAccessToken = `access.token.${tokenDate_Feb_1_1400}`;
    const onLoginRefreshToken = `refresh.token.${tokenDate_Feb_1_1700}`;
    const onLoginRememberMeToken = `remember.token.${tokenDate_Feb_28_2300}`;

    test('Test Silent Login Workflow', async () => {
        // arrange
        const context = createTestContext<TestUser, MockRequestLike>();
        context.currentDate = Feb_1_1340;

        context.serviceStub.addUser(testUserInstance.username, testUserPassword, testUserInstance, { refreshToken: storedRefreshToken, rememberMeToken: storedRememberMeToken });
        context.serviceStub.serverSideTokens = { accessToken: onLoginAccessToken, refreshToken: onLoginRefreshToken, rememberMeToken: storedRememberMeToken };
        context.tokenStorage.accessToken.setToken(storedAccessToken);
        context.tokenStorage.refreshToken.setToken(storedRefreshToken);
        context.tokenStorage.rememberMeToken.setToken(storedRememberMeToken);
        // Login
        await testSuccesfulSilentLogin(context, storedRefreshToken, testUserInstance, onLoginAccessToken, onLoginRefreshToken, storedRememberMeToken)
        // Send Request
        await testSuccessfulRequestEnrichment(context, onLoginAccessToken);
        // Test refresh on expiry
        await testRefresh(context, Feb_1_1430, Feb_1_1800);
        // logout
        context.accessManager.logout(context.mockEventCallback);
    });

    test('Test Manual Login Workflow', async () => {
        // arrange
        const context = createTestContext<TestUser, MockRequestLike>();
        context.currentDate = Feb_1_1340;
        context.serviceStub.addUser(testUserInstance.username, testUserPassword, testUserInstance);
        context.serviceStub.serverSideTokens = { accessToken: onLoginAccessToken, refreshToken: onLoginRefreshToken, rememberMeToken: onLoginRememberMeToken };
        // Login
        const loginData = { userId: 'testUser', password: 'testPassword', remember: true };
        await testSuccesfulLogin(context, loginData, testUserInstance, onLoginAccessToken, onLoginRefreshToken, onLoginRememberMeToken);
        // Send Request
        await testSuccessfulRequestEnrichment(context, onLoginAccessToken);
        // Test refresh on expiry
        await testRefresh(context, Feb_1_1430, Feb_1_1800);
        // logout
        context.accessManager.logout(context.mockEventCallback);
    });

    test('Test Login Failure', async () => {
        // arrange
        const context = createTestContext();
        context.currentDate = Feb_1_1340;
        context.serviceStub.addUser(testUserInstance.username, testUserPassword, testUserInstance);
        // act and assert
        // login
        const credentials: LoginCredentials = { userId: 'unknown', password: 'password', remember: false };
        await testUnsuccesfulLogin(context, credentials);
    });
})