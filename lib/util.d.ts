/**
 * is object a promise
 * @param p
 */
export declare function isPromise(p: any): boolean;
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
export declare class MemoryStorage implements StringTokenStorage {
    private token;
    deleteToken(): void;
    setToken(token: string): string;
    getToken(): string;
}
