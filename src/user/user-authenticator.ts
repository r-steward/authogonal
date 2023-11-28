import { Logger } from 'logging-facade';
import { LifecycleTokens, TokenAndType } from '../token/token-manager';

export const SUCCESS = 'success';
export const FAILURE = 'failure';

export const LOGIN = 'login';
export const TOKEN = 'token';
export const createLoginCredentials = (credentials: LoginCredentials): UserCredentials => ({
  credentialType: LOGIN,
  credentials,
});
export const createTokenCredentials = (credentials: TokenCredentials): UserCredentials => ({
  credentialType: TOKEN,
  credentials,
});

/**
 * Authenticates a user with a specific credential (e.g. password, external SSO token)
 */
export interface UserAuthenticator<U> {
  authenticate(userCredentials: UserCredentials): Promise<AuthenticatorResponse<U>>;
}

export type AuthenticatorResponse<U> = AuthenticatorSuccessResponse<U> | AuthenticatorFailureResponse;
export type AuthenticatorFailureResponse = {
  type: typeof FAILURE;
  error: string;
};
export type AuthenticatorSuccessResponse<U> = {
  type: typeof SUCCESS;
  user: U;
  tokens: LifecycleTokens;
};
export const createSuccessResponse = <U>(user: U, tokens: LifecycleTokens): AuthenticatorSuccessResponse<U> => ({ type: SUCCESS, user, tokens });
export const createErrorResponse = (error: string): AuthenticatorFailureResponse => ({ type: FAILURE, error });
export const resolveErrorOnIncorrectType = (logger: Logger, type: UserCredentialsType) => {
  const msg = `Incorrect credential type ${type} received`;
  logger.warn(msg);
  return Promise.resolve(createErrorResponse(msg));
}

/**
 * Credentials used for authentication
 * Credential type may vary depending on authentication method
 */
export type UserCredentialsProvider = () => UserCredentials;

/**
 * Extendable credential definition type
 * Merge new credential types into this interface
 */
export interface UserCredentialsDefinition {
  [LOGIN]: {
    userId: string;
    password: string;
    remember: boolean;
  };
  [TOKEN]: TokenAndType;
}

export type LoginCredentials = UserCredentialsDefinition[typeof LOGIN];
export type TokenCredentials = UserCredentialsDefinition[typeof TOKEN];
export type UserCredentialsType = keyof UserCredentialsDefinition;
export type UserCredentialsValue = UserCredentialsDefinition[UserCredentialsType];

export type UserCredentials = {
  [K in keyof UserCredentialsDefinition]: { credentialType: K } & { credentials: UserCredentialsDefinition[K] };
}[keyof UserCredentialsDefinition];

export type LogoutInfo = {
  credentialType: UserCredentialsType;
};
