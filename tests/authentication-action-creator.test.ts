import { AuthenticationActionCreatorImpl } from '../src/flux/action-creator-impl';
import { AuthenticationStoreImpl } from '../src/flux/auth-store-impl';
import { AuthenticationState, LogInCredentials } from '../src/user-authentication';

import { DispatcherImpl } from 'fourspace-flux-ts'
import { AuthenticationAction } from '../src/flux/flux-actions';
import { InMemoryUserAuthenticator } from '../src/impl/memory-user-authenticator';

describe('Test FLux Authentication', () => {

    test('Test success', (done) => {
        // arrange
        const user = {
            id: 1,
            username: 'testUser',
            firstname: 'Test',
            lastname: 'User',
            fullName: 'Test User',
            emailAddress: 'test@test.com',
            userToken: '',
            userTokenDate: '',
            secretKey: '',
        };
        const authDispatcher = new DispatcherImpl<AuthenticationAction<any>>();
        const authenticator = new InMemoryUserAuthenticator(new Map([
            ['testUser', { credential: 'testPassword', user }]
        ]), 'Invalid credentials');
        const actionCreator = new AuthenticationActionCreatorImpl(authDispatcher, authenticator);
        const store = new AuthenticationStoreImpl(authDispatcher);
        //
        const storeData: AuthenticationState<any>[] = [];
        const receivedEvents = new Promise((resolve) => {
            store.subscribe(() => {
                const state = store.getState();
                storeData.push(state);
                if (!state.actionState.isPendingLogin) {
                    resolve();
                }
            });
        });
        // act
        const credential: LogInCredentials = { userId: 'testUser', password: 'testPassword', remember: false };
        actionCreator.performLogin({ credentialType: null, credential });
        // assert
        receivedEvents.then(() => {
            expect(storeData.length).toBe(2);
            expect(storeData[0].actionState.isPendingLogin).toBeTruthy();
            expect(storeData[1].actionState.isPendingLogin).not.toBeTruthy();
            expect(storeData[1].actionState.loginFailed).not.toBeTruthy();
            done();
        });

    });


});

