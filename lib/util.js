"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * is object a promise
 * @param p
 */
function isPromise(p) {
    return (p === null || p === void 0 ? void 0 : p.then) !== undefined;
}
exports.isPromise = isPromise;
/**
 * Memory storage
 */
class MemoryStorage {
    deleteToken() {
        this.token = undefined;
    }
    setToken(token) {
        this.token = token;
        return this.token;
    }
    getToken() {
        return this.token;
    }
}
exports.MemoryStorage = MemoryStorage;
