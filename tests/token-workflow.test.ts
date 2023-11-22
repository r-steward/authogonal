import moment from 'moment';
import { AccessTokenResponse } from '../src/token/token-manager';
import { DateProvider } from '../src/date-provider';
import { MemoryStorage } from '../src/token/memory-token-storage';
import { TokenExpiryDecoderStringSeparated } from '../src/token/token-expiry-decoder';
import { DefaultTokenManager } from '../src/token/default-token-manager';
import { AuthUserService, PasswordLoginService, TokenLoginService } from '../src/api/auth-service';
import { DefaultAccessManager } from '../src/flux/default-access-manager';
import { AuthActions, LOGIN, StrategyUserAuthenticator, TOKEN, TokenAuthenticator, UserAuthenticator, UserCredentials, UserPasswordAuthenticator, createLoginCredentials } from '../src/'

describe('Test Request Authenticator', () => {

    // test types
    interface TestUser {
        username: string;
    }
    // test user info
    const testUserInstance: TestUser = { username: 'testUser' };
    const testUserPassword = 'testPassword';
    const testUserAccessToken = 'IOhOX_7thgqJSbL8IzACweUcIP2D--.RWyzKLK2aQqTVnSOD_NdsY-bbY6b656oqkImx2H62Bq1M7r_ea.QdeNYRgAAAA=';

    type LoginServiceTestSetup = {
        username?: string;
        password?: string;
        accessToken?: string;
        refreshToken?: string;
        rememberMeToken?: string;
        loginFail?: any;
    }

    // Mock classes
    const LoginServiceMocker = jest.fn<PasswordLoginService & TokenLoginService, [LoginServiceTestSetup]>((setup: LoginServiceTestSetup) => ({
        loginWithUserId: jest.fn((username, password, remember): Promise<AccessTokenResponse> => {
            if (username === setup.username && password === setup.password) {
                return Promise.resolve({ accessToken: setup.accessToken!, refreshToken: setup.refreshToken!, rememberMeToken: remember ? setup.accessToken : undefined });
            }
            return Promise.reject(setup.loginFail);
        }),
        loginWithRefreshToken: jest.fn((refreshToken: string): Promise<AccessTokenResponse> => { return null; }),
        loginWithRememberMeToken: jest.fn((rememberMeToken: string): Promise<AccessTokenResponse> => { return null; }),
    }));
    const DateProviderMocker = jest.fn<DateProvider, [Date]>((date) => ({
        getDateTime: jest.fn(() => date),
        saveToken: jest.fn(),
    }));
    const EventCallbackMocker = jest.fn<(e: any) => void, []>();

    const UserServiceMocker = jest.fn<AuthUserService<TestUser>, [any, any]>((loginFail, userDetailsFail) => ({
        getUserDetails: jest.fn((accessToken: string): Promise<TestUser> => { return Promise.resolve(testUserInstance) })
    }));
    // loginWithUserId: jest.fn((username: string, password: string, remember: boolean): Promise<AccessTokenResponse> => {
    //     if (username === testUserInstance.username && password === testUserPassword) {
    //         return Promise.resolve({ accessToken: testUserAccessToken, refreshToken: testUserAccessToken });
    //     }
    //     return Promise.reject(loginFail);
    // }),
    // getUserDetails: jest.fn((accessToken: string): Promise<TestUser> => {
    //     if (accessToken === testUserAccessToken) {
    //         return Promise.resolve(testUserInstance);
    //     }
    //     return Promise.reject(userDetailsFail);
    // }),

    // const DispatcherMocker = jest.fn<Dispatcher<AuthenticationAction<TestUser>>, []>(() => ({
    //     dispatch: jest.fn((payload: any): void => { })
    // }));

    // Build the action creator, returning mock objects for assertions
    function buildAccessManager(testDate: Date) {
        const loginSetup: LoginServiceTestSetup = {
            username: testUserInstance.username,
            password: testUserPassword,
            accessToken: testUserAccessToken,
            refreshToken: testUserAccessToken,
            rememberMeToken: testUserAccessToken,
            loginFail: new Error('Login Error')
        }
        const userService = new UserServiceMocker('', '');
        const loginServices = new LoginServiceMocker(loginSetup);
        const authenticator = new StrategyUserAuthenticator(new Map([
            [LOGIN, <UserAuthenticator<TestUser>>new UserPasswordAuthenticator(userService, loginServices)],
            [TOKEN, <UserAuthenticator<TestUser>>new TokenAuthenticator(userService, loginServices)]
        ]))
        const tokenManager = new DefaultTokenManager(
            new MemoryStorage(),
            new MemoryStorage(),
            new MemoryStorage(),
            new TokenExpiryDecoderStringSeparated('.'),
            new DateProviderMocker(testDate),
        );
        const accessManager = new DefaultAccessManager(authenticator, tokenManager);
        return { accessManager, userService, loginServices };
    }

    test('Test Login Succeed', async () => {
        // arrange
        const testDate = moment(Date.UTC(2020, 1, 1, 14, 20)).toDate();
        const { accessManager, userService, loginServices } = buildAccessManager(testDate);
        const eventCallback = EventCallbackMocker;
        // act
        const loginData = { userId: 'testUser', password: 'testPassword', remember: true };
        const loginCredentials: UserCredentials = createLoginCredentials(loginData);
        const loggedIn = await accessManager.manualLogin(loginCredentials, eventCallback);
        // assert
        expect(loggedIn).toBe(true);
        expect(loginServices.loginWithUserId).toHaveBeenCalledTimes(1);
        expect(loginServices.loginWithUserId).toHaveBeenCalledWith(loginData.userId, loginData.password, loginData.remember);
        expect(userService.getUserDetails).toHaveBeenCalledTimes(1);
        expect(userService.getUserDetails).toHaveBeenCalledWith(testUserAccessToken);
        expect(eventCallback).toHaveBeenCalledTimes(2);
        expect(eventCallback).toHaveBeenCalledWith<AuthActions.RequestedManualLoginAction[]>(
            {
                type: AuthActions.REQUESTED_MANUAL_LOGIN,
                credentials: loginCredentials
            });
        expect(eventCallback).toHaveBeenCalledWith<AuthActions.ManualLoginSuccessAction<TestUser>[]>(
            {
                type: AuthActions.MANUAL_LOGIN_SUCCESS,
                authenticatedUser: testUserInstance,
            });
    });

    // test('Test Login Failed', async () => {
    //     // arrange
    //     const testDate = moment(Date.UTC(2020, 1, 1, 14, 20)).toDate();
    //     const [dispatcher, userService, actionCreator] = buildCreator(testDate);
    //     // act
    //     const loginCredentials: LogInCredentials = { userId: 'testUser', password: 'wrong', remember: true };
    //     const userCredentials = { credentialType: CredentialType.UserPassword, credential: loginCredentials };
    //     await actionCreator.performLogin(userCredentials);
    //     // assert
    //     expect(userService.loginWithUserId).toHaveBeenCalledTimes(1);
    //     expect(userService.loginWithUserId).toHaveBeenCalledWith(loginCredentials.userId, loginCredentials.password, loginCredentials.remember);
    //     expect(userService.getUserDetails).toHaveBeenCalledTimes(0);
    //     expect(dispatcher.dispatch).toHaveBeenCalledTimes(2);
    //     expect(dispatcher.dispatch).toHaveBeenCalledWith<StartLoginAction[]>(
    //         {
    //             type: START_LOGIN
    //         });
    //     expect(dispatcher.dispatch).toHaveBeenCalledWith<LoginFailedAction[]>(
    //         {
    //             type: LOGIN_FAILURE,
    //             payload: {
    //                 userCredentials,
    //                 failureReason: 'Login Error',
    //             },
    //         });
    // });

    // test('Test Token Succeed', async () => {
    //     // arrange
    //     const testDate = moment(Date.UTC(2020, 1, 1, 14, 20)).toDate();
    //     const [dispatcher, userService, actionCreator] = buildCreator(testDate);
    //     // act
    //     const userCredentials = { credentialType: CredentialType.Token, credential: testUserAccessToken };
    //     await actionCreator.performLogin(userCredentials);
    //     // assert
    //     expect(userService.loginWithUserId).toHaveBeenCalledTimes(0);
    //     expect(userService.getUserDetails).toHaveBeenCalledTimes(1);
    //     expect(userService.getUserDetails).toHaveBeenCalledWith(userCredentials.credential);
    //     expect(dispatcher.dispatch).toHaveBeenCalledTimes(2);
    //     expect(dispatcher.dispatch).toHaveBeenCalledWith<StartLoginAction[]>(
    //         {
    //             type: START_LOGIN
    //         });
    //     expect(dispatcher.dispatch).toHaveBeenCalledWith<LoginSuccessAction<TestUser>[]>(
    //         {
    //             type: LOGIN_SUCCESS,
    //             payload: {
    //                 userCredentials,
    //                 authenticatedUser: testUserInstance,
    //             },
    //         });
    // });

    // test('Test Token Failed', async () => {
    //     // arrange
    //     const testDate = moment(Date.UTC(2020, 1, 1, 14, 20)).toDate();
    //     const [dispatcher, userService, actionCreator] = buildCreator(testDate);
    //     // act
    //     const userCredentials = { credentialType: CredentialType.Token, credential: 'FAKE_TOKEN' };
    //     await actionCreator.performLogin(userCredentials);
    //     // assert
    //     expect(userService.loginWithUserId).toHaveBeenCalledTimes(0);
    //     expect(userService.getUserDetails).toHaveBeenCalledTimes(1);
    //     expect(userService.getUserDetails).toHaveBeenCalledWith(userCredentials.credential);
    //     expect(dispatcher.dispatch).toHaveBeenCalledTimes(2);
    //     expect(dispatcher.dispatch).toHaveBeenCalledWith<StartLoginAction[]>(
    //         {
    //             type: START_LOGIN
    //         });
    //     expect(dispatcher.dispatch).toHaveBeenCalledWith<LoginFailedAction[]>(
    //         {
    //             type: LOGIN_FAILURE,
    //             payload: {
    //                 userCredentials,
    //                 failureReason: 'User Details Error',
    //             },
    //         });
    // });



});