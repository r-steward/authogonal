# `Authogonal`
Typescript Client Authentication Library

Provides functionality for logging into a web service, and managing tokens that allow SPA to work seamlessly with 


The main interface to the authentication library is the UserAuthenticator.
```js
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