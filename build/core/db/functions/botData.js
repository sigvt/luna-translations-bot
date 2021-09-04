"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToBotRelayHistory = exports.getRelayHistory = exports.getBotData = exports.getNotifiedCommunityPosts = exports.addNotifiedCommunityPost = exports.getNotifiedLives = exports.addNotifiedLive = exports.botDataEnmap = void 0;
const enmap_1 = __importDefault(require("enmap"));
const helpers_1 = require("../../../helpers");
const immutableES6MapFunctions_1 = require("../../../helpers/immutableES6MapFunctions");
const models_1 = require("../models");
const _id = '000000000022';
exports.botDataEnmap = new enmap_1.default({ name: 'botData' });
function addNotifiedLive(videoId) {
    const currentList = exports.botDataEnmap.ensure('notifiedYtLives', []);
    exports.botDataEnmap.set('notifiedYtLives', [...currentList, videoId]);
}
exports.addNotifiedLive = addNotifiedLive;
function getNotifiedLives() {
    return exports.botDataEnmap.ensure('notifiedYtLives', []);
}
exports.getNotifiedLives = getNotifiedLives;
function addNotifiedCommunityPost(url) {
    const currentList = exports.botDataEnmap.ensure('notifiedCommunityPosts', []);
    exports.botDataEnmap.set('notifiedCommunityPosts', [...currentList, url]);
}
exports.addNotifiedCommunityPost = addNotifiedCommunityPost;
function getNotifiedCommunityPosts() {
    return exports.botDataEnmap.ensure('notifiedCommunityPosts', []);
}
exports.getNotifiedCommunityPosts = getNotifiedCommunityPosts;
async function getBotData() {
    (0, helpers_1.debug)('getting the bot data');
    const query = [{ _id }, {}, { upsert: true, new: true }];
    return models_1.BotDataDb.findOneAndUpdate(...query);
}
exports.getBotData = getBotData;
async function getRelayHistory(videoId) {
    const botData = await getBotData();
    const hists = botData.relayHistory;
    return hists.get(videoId ?? '');
}
exports.getRelayHistory = getRelayHistory;
async function addToBotRelayHistory(videoId, cmt) {
    const history = (await getBotData()).relayHistory;
    const cmts = history.get(videoId) ?? [];
    const newHistory = (0, immutableES6MapFunctions_1.setKey)(videoId, [...cmts, cmt])(history);
    updateBotData({ relayHistory: newHistory });
}
exports.addToBotRelayHistory = addToBotRelayHistory;
///////////////////////////////////////////////////////////////////////////////
async function updateBotData(update) {
    const query = [{ _id }, update, { upsert: true, new: true }];
    await models_1.BotDataDb.findOneAndUpdate(...query);
}
//# sourceMappingURL=botData.js.map