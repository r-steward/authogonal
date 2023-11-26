"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveErrorOnIncorrectType = exports.createErrorResponse = exports.createSuccessResponse = exports.createTokenCredentials = exports.createLoginCredentials = exports.TOKEN = exports.LOGIN = exports.FAILURE = exports.SUCCESS = void 0;
exports.SUCCESS = 'success';
exports.FAILURE = 'failure';
exports.LOGIN = 'login';
exports.TOKEN = 'token';
const createLoginCredentials = (credentials) => ({
    credentialType: exports.LOGIN,
    credentials,
});
exports.createLoginCredentials = createLoginCredentials;
const createTokenCredentials = (credentials) => ({
    credentialType: exports.TOKEN,
    credentials,
});
exports.createTokenCredentials = createTokenCredentials;
const createSuccessResponse = (user, tokens) => ({ type: exports.SUCCESS, user, tokens });
exports.createSuccessResponse = createSuccessResponse;
const createErrorResponse = (error) => ({ type: exports.FAILURE, error });
exports.createErrorResponse = createErrorResponse;
const resolveErrorOnIncorrectType = (logger, type) => {
    const msg = `Incorrect credential type ${type} received`;
    logger.warn(msg);
    return Promise.resolve((0, exports.createErrorResponse)(msg));
};
exports.resolveErrorOnIncorrectType = resolveErrorOnIncorrectType;
