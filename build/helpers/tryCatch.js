"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncTryOrLog = exports.tryOrLog = exports.asyncTryOrDefault = exports.tryOrDefault = void 0;
const logging_1 = require("./logging");
function tryOrDefault(tryFn, defaultValue) {
    try {
        return tryFn();
    }
    catch (e) {
        (0, logging_1.debug)(e);
        return defaultValue;
    }
}
exports.tryOrDefault = tryOrDefault;
async function asyncTryOrDefault(tryFn, defaultValue) {
    try {
        const value = await tryFn();
        return value;
    }
    catch (e) {
        (0, logging_1.debug)(e);
        return defaultValue;
    }
}
exports.asyncTryOrDefault = asyncTryOrDefault;
function tryOrLog(tryFn) {
    return tryOrDefault(tryFn, undefined);
}
exports.tryOrLog = tryOrLog;
async function asyncTryOrLog(tryFn) {
    return asyncTryOrDefault(tryFn, undefined);
}
exports.asyncTryOrLog = asyncTryOrLog;
//# sourceMappingURL=tryCatch.js.map