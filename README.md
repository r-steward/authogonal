# `Authogonal`
### Typescript Client Authentication Library

Authogonal provides functionality for authenticated web service access, managing login and tokens that allow SPA to work seamlessly with back end authenticated requests.
It is designed primarily to easily integrate with an event based state management UI (e.g. react with redux).
The implementation is framework agnostic, to allow any side-effect managment style to be used (e.g. thunks, sagas, or observables)

### Quick Start

The following is a quick start example with a redux set up.

#### State Management
An action handler is provided to handle the authentication state.

```ts
import * as Authogonal from 'authogonal';

// Set an authentication slice on the app state
export interface AppState {
    authentication: AuthenticationState;
    /* rest of the app state*/
}

// Set the provided handler on the reducer
const rootReducer = combineReducers({
    authentication: Authogonal.handleAuthAction,
    /* Other app reducers */
});

// Create redux store
const reduxStore = createStore(rootReducer, ... middleware ...);
```

#### Side effects
The side effect management depends on the framework used (e.g. thunks, or observables).
Helper classes and functions are provided to enable integration with whatever side effect management style is used.

```ts
import * as Authogonal from 'authogonal';

// create the access manager using the provided builder, with required services
const accessManager = Authogonal.newAccessManagerBuilder<AppUser>()
  .setPasswordLoginService(passwordLoginService)
  .setTokenLoginService(tokenLoginService)
  .setUserService(userService)
  .build();

// If using redux thunk, you can use the provided action creator
const actionCreator = new Authogonal.AuthogonalActionCreator(accessManager);
actionCreator.initializeRefresh(dispatch);
const onLogin = async (userId: string, password: string): Promise<boolean> => {
  const loginCredentials = Authogonal.createLoginCredentials({ userId, password,remember: true});
  const loginThunk = actionCreator.createManualLoginAction(loginCredentials)
  return await dispatch(loginThunk);
}

// For redux-observable, set up epics using provided callback converters
accessManager.setRefreshTimerCallback(dispatch);
const onRefreshRequired = (action$: Observable<Authogonal.PerformRefreshLoginAction>) => {
    return action$.pipe(
        ofType(Authogonal.PERFORM_REFRESH_LOGIN),
        switchMap(event => {
            return new Observable<Authogonal.SilentLoginActions<AppUer>>(observer => {
                accessManager.silentLogin(Authogonal.observerToSilentLoginCallback(observer));
            })
        })
    );
}
const onManualLogin = (action$: Observable<Authogonal.PerformManualLoginAction>) => {
    return action$.pipe(
        ofType(Authogonal.PERFORM_MANUAL_LOGIN),
        switchMap(event => {
            return new Observable<Authogonal.ManualLoginActions<AppUser>>(observer => {
                accessManager.manualLogin(event.credentials, Authogonal.observerToManualLoginCallback(observer));
            })
        })
    );
}
const rootEpic = combineEpics(
    onRefreshRequired,
    onManualLogin
)
```

#### Request enrichment
API requests can be enriched with authorization tokens using the supplied request enrichers.
For example, with SuperAgent

```ts
        const req = Request.post(uri).send(body);
        const authed = (authAppender != null ? authAppender.authorizeRequest(req) : req);
        try {
            const response = await authed;


```
For side effects, there are some helpers provided for use with thunk or observable


### Documentation
The main interface to the authentication library is the AccessManager.
```ts
interface AccessManager {
  silentLogin(eventCallback: SilentLoginCallback<U>): Promise<boolean>;
  manualLogin(credentials: UserCredentials, eventCallback: ManualLoginCallback<U>): Promise<boolean>;
  onUnauthorized(eventCallback: AuthActions.EventCallback<U>): Promise<boolean>;
}
```
These methods and event callbacks allow you to call authentication functionality, and forward authentication events, via your particular side-effect management implementation.

The request enricher supplements back end requests with appropriate authentication once a user has been authenticated (e.g. auth tokens)
```ts
export interface RequestEnricher<R> {
  authorizeRequest(request: R): Promise<R>;
}
```
### API services

```ts
export interface UserAuthenticator<U> {
  authenticate(userCredentials: UserCredentials): Promise<U>;
  logout(logoutInfo: LogoutInfo): Promise<void>;
}
```
Authenticate with e.g. login credentials (username/password).
```js
const userCredentials: 
```

Once a user has been authenticated, API requests can be authenticated using the RequestAuthenticator (e.g. by adding a security token to a request header)
```js
import { AuthenticatorResponse, LogoutInfo, UserAuthenticator, UserCredentials, UserCredentialsDefinition } from "./user-authenticator";

declare module './user-authenticator' {
    export interface UserCredentialsDefinition {
        bespoke: { name: string }
    }
}

export class BespokeAuthenticator<U> implements UserAuthenticator<U> {
    authenticate(userCredentials: UserCredentials): Promise<AuthenticatorResponse<U>> {
        if (userCredentials.credentialType === 'bespoke') {

        }
        throw new Error("Method not implemented.");
    }


```



## Token Lifecycle
* On start up, check tokens
    * Access token is unexpired then attempt to get user details
        * if successful then consider as logged in.
        * if auth exception then atttempt with refresh token
    * Refresh token is unexpired, then try and refresh access token
        * if successful then get user details and consider as logged in
        * if exception then attempt with remember me token
    * Remember me token exists and unexpired, try to refresh with this token
        * if successful then get user details and consider as logged in
        * if exception then need to log in
* User logs in with username and password
* Access token, refresh token (and optionally remember me token) stored
* When access token expires, request a new one via the refresh token. 
* When refresh token expires, try with remember me token, or force a log in