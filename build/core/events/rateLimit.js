"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = void 0;
const helpers_1 = require("../../helpers");
function rateLimit(data) {
    (0, helpers_1.warn)(`RATE LIMITED! ${JSON.stringify(data)}`);
}
exports.rateLimit = rateLimit;
//# sourceMappingURL=rateLimit.js.map