import { AuthUserService, PasswordLoginService, TokenLoginService } from '../api/auth-service';
import { DateProvider, DateProviderSystem } from '../date-provider';
import { RequestEnricher, RequestLike, TokenRequestEnricher } from '../request';
import {
  DefaultTokenManager,
  DefaultTokenProvider,
  MemoryStorage,
  StringTokenStorage,
  TokenExpiryDecoder,
  TokenExpiryDecoderStringSeparated,
  TokenManager,
} from '../token';
import {
  LOGIN,
  StrategyUserAuthenticator,
  TOKEN,
  TokenAuthenticator,
  UserAuthenticator,
  UserPasswordAuthenticator,
} from '../user';
import { AccessManager } from './access-manager';
import { DefaultAccessManager } from './default-access-manager';

export const newAccessManagerBuilder = <TUser, TRequest extends RequestLike>() =>
  new DefaultAccessManagerBuilder<TUser, TRequest>();

export interface AccessManagerBuilder<TUser, TRequest> {
  setDateProvider(value: DateProvider): this;
  setTokenStorage(value: AllTokenStorage): this;
  setTokenManager(tokenManager: TokenManager): this;
  setExpiryDecoder(value: TokenExpiryDecoder): this;
  setUserAuthenticator(userAuthenticator: UserAuthenticator<TUser>): this;
  setUserService(userService: AuthUserService<TUser>): this;
  setPasswordLoginService(loginService: PasswordLoginService): this;
  setTokenLoginService(loginService: TokenLoginService): this;
  build(): AccessManager<TUser, TRequest>;
}

export interface AllTokenStorage {
  accessToken: StringTokenStorage;
  refreshToken: StringTokenStorage;
  rememberMeToken: StringTokenStorage;
}

class DefaultAccessManagerBuilder<TUser, TRequest extends RequestLike>
  implements AccessManagerBuilder<TUser, TRequest> {
  private _userAuthenticator: UserAuthenticator<TUser>;
  private _userService: AuthUserService<TUser>;
  private _passwordLoginService: PasswordLoginService;
  private _tokenLoginService: TokenLoginService;
  private _tokenManager: TokenManager;
  private _tokenStorage: AllTokenStorage;
  private _dateProvider: DateProvider;
  private _expiryDecoder: TokenExpiryDecoder;

  build(): AccessManager<TUser, TRequest> {
    const userAuthenticator = this.getUserAuthenticator();
    const tokenManager = this.getTokenManager();
    const requestEnricher = new TokenRequestEnricher<TRequest>(new DefaultTokenProvider(tokenManager));
    return new DefaultAccessManager(requestEnricher, userAuthenticator, tokenManager);
  }

  public setDateProvider(value: DateProvider): this {
    this._dateProvider = value;
    return this;
  }

  public setTokenStorage(value: AllTokenStorage): this {
    this._tokenStorage = value;
    return this;
  }

  public setTokenManager(tokenManager: TokenManager): this {
    this._tokenManager = tokenManager;
    return this;
  }

  public setExpiryDecoder(value: TokenExpiryDecoder): this {
    this._expiryDecoder = value;
    return this;
  }

  public setUserAuthenticator(userAuthenticator: UserAuthenticator<TUser>): this {
    this._userAuthenticator = userAuthenticator;
    return this;
  }

  public setUserService(userService: AuthUserService<TUser>): this {
    this._userService = userService;
    return this;
  }

  public setPasswordLoginService(loginService: PasswordLoginService): this {
    this._passwordLoginService = loginService;
    return this;
  }

  public setTokenLoginService(loginService: TokenLoginService): this {
    this._tokenLoginService = loginService;
    return this;
  }

  private getDateProvider(): DateProvider {
    if (this._dateProvider == null) {
      this._dateProvider = new DateProviderSystem();
    }
    return this._dateProvider;
  }

  private getUserService() {
    if (this._userService == null) {
      throw new Error('UserService not supplied to builder');
    }
    return this._userService;
  }

  private getPasswordLoginService() {
    if (this._passwordLoginService == null) {
      throw new Error('PasswordLoginService not supplied to builder');
    }
    return this._passwordLoginService;
  }

  private getTokenLoginService() {
    if (this._tokenLoginService == null) {
      throw new Error('TokenLoginService not supplied to builder');
    }
    return this._tokenLoginService;
  }

  private getExpiryDecoder(): TokenExpiryDecoder {
    if (this._expiryDecoder == null) {
      this._expiryDecoder = new TokenExpiryDecoderStringSeparated('.');
    }
    return this._expiryDecoder;
  }

  private getTokenStorage(): AllTokenStorage {
    if (this._tokenStorage == null) {
      this._tokenStorage = {
        accessToken: new MemoryStorage(),
        refreshToken: new MemoryStorage(),
        rememberMeToken: new MemoryStorage(),
      };
    }
    return this._tokenStorage;
  }

  private getTokenManager() {
    if (this._tokenManager == null) {
      const storage = this.getTokenStorage();
      this._tokenManager = new DefaultTokenManager(
        storage.accessToken,
        storage.refreshToken,
        storage.rememberMeToken,
        this.getExpiryDecoder(),
        this.getDateProvider(),
      );
    }
    return this._tokenManager;
  }

  private getUserAuthenticator() {
    if (this._userAuthenticator == null) {
      const userService = this.getUserService();
      const passwordLoginService = this.getPasswordLoginService();
      const tokenLoginService = this.getTokenLoginService();
      this._userAuthenticator = new StrategyUserAuthenticator(
        new Map([
          [LOGIN, new UserPasswordAuthenticator(userService, passwordLoginService) as UserAuthenticator<TUser>],
          [TOKEN, new TokenAuthenticator(userService, tokenLoginService) as UserAuthenticator<TUser>],
        ]),
      );
    }
    return this._userAuthenticator;
  }
}
