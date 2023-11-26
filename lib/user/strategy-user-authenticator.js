"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrategyUserAuthenticator = void 0;
const user_authenticator_1 = require("./user-authenticator");
/**
 * Strategy decorator to handle multiple types of user authentication
 */
class StrategyUserAuthenticator {
    constructor(strategyMap) {
        this.strategyMap = strategyMap;
    }
    authenticate(userCredentials) {
        return __awaiter(this, void 0, void 0, function* () {
            const service = this.strategyMap.get(userCredentials.credentialType);
            if (service != null) {
                return yield service.authenticate(userCredentials);
            }
            else {
                return (0, user_authenticator_1.createErrorResponse)(`No authenticator configured for credentials ${userCredentials.credentialType}`);
            }
        });
    }
}
exports.StrategyUserAuthenticator = StrategyUserAuthenticator;
