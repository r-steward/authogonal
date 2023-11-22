import { StringTokenStorage } from "./token-manager";
/**
 * Memory storage
 */
export declare class MemoryStorage implements StringTokenStorage {
    private token;
    deleteToken(): void;
    setToken(token: string): string;
    getToken(): string;
}
