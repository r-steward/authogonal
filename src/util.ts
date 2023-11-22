/**
 * is object a promise
 * @param p
 */
export function isPromise(p: any) {
  return p?.then !== undefined;
}

/**
 * Client storage
 */
export interface StringTokenStorage {
  deleteToken(): void;

  setToken(token: string): string;

  getToken(): string;
}

/**
 * Memory storage
 */
export class MemoryStorage implements StringTokenStorage {
  private token: string;

  deleteToken(): void {
    this.token = undefined;
  }
  setToken(token: string): string {
    this.token = token;
    return this.token;
  }
  getToken(): string {
    return this.token;
  }
}

