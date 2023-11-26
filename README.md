# `Authogonal`
### Typescript Client Authentication Library

Authogonal provides functionality for authenticated web service access, managing login and tokens that allow SPA to work seamlessly with back end authenticated requests.
It is designed primarily to easily integrate with an event based state management UI (e.g. react with redux).
The implementation is framework agnostic, to allow any side-effect managment style to be used (e.g. thunks, sagas, or observables)

### Quick Start

```ts
const accessManager = newAccessManagerBuilder().build();

```

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