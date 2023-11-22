import { StringTokenStorage } from "./token-manager";

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