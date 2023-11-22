"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryStorage = void 0;
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
