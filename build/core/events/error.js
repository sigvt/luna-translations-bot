"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.error = void 0;
const helpers_1 = require("../../helpers");
function error(error) {
    (0, helpers_1.warn)('Discord.js error:\n' + JSON.stringify(error));
}
exports.error = error;
//# sourceMappingURL=error.js.map