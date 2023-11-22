"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPromise = void 0;
/**
 * is object a promise
 * @param p
 */
function isPromise(p) {
    return (p === null || p === void 0 ? void 0 : p.then) !== undefined;
}
exports.isPromise = isPromise;
