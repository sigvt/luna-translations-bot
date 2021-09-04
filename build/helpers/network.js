"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Params = exports.getText = exports.getJson = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const logging_1 = require("./logging");
async function getJson(endpoint, options) {
    const resp = await (0, node_fetch_1.default)(endpoint, options);
    if (resp.status === 200)
        return resp.json();
    (0, logging_1.debug)(await resp.text());
    throw new Error('fetch error code non 200');
}
exports.getJson = getJson;
async function getText(endpoint, options) {
    const resp = await (0, node_fetch_1.default)(endpoint, options);
    return resp.text();
}
exports.getText = getText;
function Params(params) {
    return new URLSearchParams(params);
}
exports.Params = Params;
//# sourceMappingURL=network.js.map