"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ready = void 0;
const __1 = require("../");
const config_1 = require("../../config");
const helpers_1 = require("../../helpers");
const functions_1 = require("../db/functions");
async function ready() {
    (0, helpers_1.log)(`${__1.client.user.tag} serving ${__1.client.guilds.cache.size} servers.`);
    __1.client.user.setActivity(`${config_1.config.prefix}help`, { type: 'PLAYING' });
    Promise.resolve().then(() => __importStar(require('../../modules/community/communityNotifier')));
    Promise.resolve().then(() => __importStar(require('../../modules/youtubeNotifier')));
    Promise.resolve().then(() => __importStar(require('../../modules/twitcastingNotifier')));
    Promise.resolve().then(() => __importStar(require('../../modules/livechat/chatRelayer')));
    setInterval(functions_1.clearOldData, 24 * 60 * 60 * 100);
}
exports.ready = ready;
//# sourceMappingURL=ready.js.map