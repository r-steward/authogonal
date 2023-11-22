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

}