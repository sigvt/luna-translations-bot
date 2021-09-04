"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGuildData = exports.clearOldData = exports.getGuildData = exports.updateGuildData = exports.excludeLine = exports.getNoticeFromMsgId = exports.addBlacklistNotice = exports.deleteRelayHistory = exports.addToGuildRelayHistory = exports.getFlatGuildRelayHistory = exports.findVidIdAndCulpritByMsgId = exports.addRelayNotice = exports.getRelayNotices = exports.getGuildRelayHistory = exports.getAllRelayHistories = exports.guildDataEnmap = void 0;
const immutable_1 = require("immutable");
const ramda_1 = require("ramda");
const discord_1 = require("../../../helpers/discord");
const immutableES6MapFunctions_1 = require("../../../helpers/immutableES6MapFunctions");
const lunaBotClient_1 = require("../../lunaBotClient");
const enmap_1 = __importDefault(require("enmap"));
exports.guildDataEnmap = new enmap_1.default({ name: 'guildData' });
function getAllRelayHistories() {
    const datas = lunaBotClient_1.client.guilds.cache.map(getGuildData);
    const snowflakes = datas.map(g => g._id);
    const histories = datas.map(g => (0, immutable_1.Map)(g.relayHistory));
    return (0, immutable_1.Map)((0, ramda_1.zip)(snowflakes, histories));
}
exports.getAllRelayHistories = getAllRelayHistories;
function getGuildRelayHistory(g, videoId) {
    const data = getGuildData(g);
    return videoId ? data.relayHistory.get(videoId) ?? []
        : (0, immutable_1.Map)(data.relayHistory);
}
exports.getGuildRelayHistory = getGuildRelayHistory;
function getRelayNotices(g) {
    return (0, immutable_1.Map)(getGuildData(g).relayNotices);
}
exports.getRelayNotices = getRelayNotices;
function addRelayNotice(g, videoId, msgId) {
    const data = getGuildData(g);
    const newNotices = (0, immutableES6MapFunctions_1.setKey)(videoId, msgId)(data.relayNotices);
    updateGuildData(g, { relayNotices: newNotices });
}
exports.addRelayNotice = addRelayNotice;
function findVidIdAndCulpritByMsgId(g, msgId) {
    const histories = g ? getGuildRelayHistory(g) : undefined;
    const predicate = (cs) => cs.some(c => c.msgId === msgId);
    const vidId = histories?.findKey(predicate);
    const history = histories?.find(predicate);
    const culprit = history?.find(c => c.msgId === msgId);
    return [vidId, culprit];
}
exports.findVidIdAndCulpritByMsgId = findVidIdAndCulpritByMsgId;
function getFlatGuildRelayHistory(g) {
    const histories = getGuildRelayHistory(g);
    return histories.toList().toArray().flat();
}
exports.getFlatGuildRelayHistory = getFlatGuildRelayHistory;
function addToGuildRelayHistory(videoId, cmt, g) {
    const history = getGuildData(g).relayHistory;
    const cmts = history.get(videoId) ?? [];
    const newHistory = (0, immutableES6MapFunctions_1.setKey)(videoId, [...cmts, cmt])(history);
    updateGuildData(g, { relayHistory: newHistory });
}
exports.addToGuildRelayHistory = addToGuildRelayHistory;
function deleteRelayHistory(videoId, g) {
    const history = getGuildData(g).relayHistory;
    updateGuildData(g, { relayHistory: ((0, immutableES6MapFunctions_1.deleteKey)(videoId)(history)) });
}
exports.deleteRelayHistory = deleteRelayHistory;
function addBlacklistNotice({ g, msgId, ytId, videoId, originalMsgId }) {
    const notices = getGuildData(g).blacklistNotices;
    const newNotice = { ytId, videoId, originalMsgId };
    updateGuildData(g, { blacklistNotices: ((0, immutableES6MapFunctions_1.setKey)(msgId, newNotice)(notices)) });
}
exports.addBlacklistNotice = addBlacklistNotice;
function getNoticeFromMsgId(g, msgId) {
    return getGuildData(g).blacklistNotices.get(msgId);
}
exports.getNoticeFromMsgId = getNoticeFromMsgId;
function excludeLine(g, videoId, msgId) {
    const history = getGuildData(g).relayHistory;
    const vidLog = history.get(videoId) ?? [];
    const culprit = vidLog.findIndex(cmt => cmt.msgId === msgId);
    const vidHistory = [...vidLog.slice(0, culprit), ...vidLog.slice(culprit)];
    const relayHistory = (0, immutableES6MapFunctions_1.setKey)(videoId, vidHistory)(history);
    if (vidLog.length > 0)
        updateGuildData(g, { relayHistory });
}
exports.excludeLine = excludeLine;
function updateGuildData(g, update) {
    const _id = ((0, discord_1.isGuild)(g) ? g.id : g) ?? '0';
    const current = getGuildData(g);
    const newData = { ...current, ...update };
    exports.guildDataEnmap.set(_id, newData);
}
exports.updateGuildData = updateGuildData;
function getGuildData(g) {
    const _id = ((0, discord_1.isGuild)(g) ? g.id : g) ?? '0';
    const defaults = {
        _id,
        relayNotices: new Map(),
        relayHistory: new Map(),
        blacklistNotices: new Map()
    };
    return exports.guildDataEnmap.ensure(_id, defaults);
}
exports.getGuildData = getGuildData;
function clearOldData() {
    const now = new Date().getTime();
    const WEEK = 7 * 24 * 60 * 60 * 1000;
    const isRecentHist = (v) => !!(0, ramda_1.head)(v)?.msgId && ((0, discord_1.snowflakeToUnix)((0, ramda_1.head)(v).msgId) - now) < WEEK;
    const isRecentK = (_, k) => ((0, discord_1.snowflakeToUnix)(k) - now) < WEEK;
    const isRecentV = (v) => ((0, discord_1.snowflakeToUnix)(v) - now) < WEEK;
    lunaBotClient_1.client.guilds.cache.forEach(g => {
        const guildData = getGuildData(g);
        const newRelayNotices = (0, immutableES6MapFunctions_1.filter)(guildData.relayNotices, isRecentV);
        const newBlacklistNotices = (0, immutableES6MapFunctions_1.filter)(guildData.blacklistNotices, isRecentK);
        const newRelayHistory = (0, immutableES6MapFunctions_1.filter)(guildData.relayHistory, isRecentHist);
        updateGuildData(guildData._id, { relayNotices: newRelayNotices });
        updateGuildData(guildData._id, { relayHistory: newRelayHistory });
        updateGuildData(guildData._id, { blacklistNotices: newBlacklistNotices });
    });
}
exports.clearOldData = clearOldData;
function deleteGuildData(g) {
    if (exports.guildDataEnmap.has(g))
        exports.guildDataEnmap.delete(g);
}
exports.deleteGuildData = deleteGuildData;
//# sourceMappingURL=guildData.js.map