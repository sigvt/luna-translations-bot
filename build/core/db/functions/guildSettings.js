"use strict";
/** @file Functions accessing or interfacing with Guild settings */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGuildSettings = exports.filterAndStringifyHistory = exports.getPermLevel = exports.isBlacklister = exports.isAdmin = exports.updateSettings = exports.isBlacklisted = exports.removeBlacklisted = exports.addBlacklisted = exports.getAllSettings = exports.getSettings = exports.guildSettingsEnmap = void 0;
const discord_js_1 = require("discord.js");
const discord_1 = require("../../../helpers/discord");
const config_1 = require("../../../config");
const helpers_1 = require("../../../helpers");
const lunaBotClient_1 = require("../../lunaBotClient");
const enmap_1 = __importDefault(require("enmap"));
exports.guildSettingsEnmap = new enmap_1.default({ name: 'guildSettings' });
/**
 * Returns guild settings from the DB or creates them if they don't exist.
 * Returns default settings for DMs. (guildId 0)
 */
function getSettings(x) {
    const id = (typeof x === 'string') ? x : (0, discord_1.getGuildId)(x);
    return getGuildSettings(id ?? '0');
}
exports.getSettings = getSettings;
function getAllSettings() {
    return lunaBotClient_1.client.guilds.cache.map(getGuildSettings);
}
exports.getAllSettings = getAllSettings;
function addBlacklisted(g, item) {
    updateSettings(g, { blacklist: [...getSettings(g).blacklist, item] });
}
exports.addBlacklisted = addBlacklisted;
function removeBlacklisted(g, ytId) {
    const { blacklist } = getSettings(g);
    const isValid = blacklist.some(entry => entry.ytId === ytId);
    const newBlacklist = blacklist.filter(entry => entry.ytId !== ytId);
    if (isValid)
        updateSettings(g, { blacklist: newBlacklist });
    return isValid;
}
exports.removeBlacklisted = removeBlacklisted;
function isBlacklisted(ytId, gid) {
    return getSettings(gid).blacklist.some(entry => entry.ytId === ytId);
}
exports.isBlacklisted = isBlacklisted;
function updateSettings(x, update) {
    const isObject = x instanceof discord_js_1.Message
        || x instanceof discord_js_1.Guild
        || x instanceof discord_js_1.GuildMember;
    const _id = isObject ? ((0, discord_1.getGuildId)(x) ?? '0') : x;
    const current = getSettings(_id);
    const newData = { ...current, ...update };
    exports.guildSettingsEnmap.set(_id, newData);
}
exports.updateSettings = updateSettings;
function isAdmin(x) {
    return hasPerms(x, 'admins');
}
exports.isAdmin = isAdmin;
function isBlacklister(x) {
    return hasPerms(x, 'blacklisters');
}
exports.isBlacklister = isBlacklister;
async function getPermLevel(x) {
    const perms = getPermLevels();
    const userPerm = await (0, helpers_1.asyncFind)(perms, level => level.check(x));
    return userPerm;
}
exports.getPermLevel = getPermLevel;
function filterAndStringifyHistory(guild, history, start) {
    const g = getSettings(guild);
    const blacklist = g.blacklist.map(entry => entry.ytId);
    const unwanted = g.customBannedPatterns;
    return history
        .filter(cmt => isNotBanned(cmt, unwanted, blacklist))
        .map(cmt => {
        const startTime = new Date(Date.parse(start ?? '')).valueOf();
        const loggedTime = new Date(+cmt.absoluteTime).valueOf();
        const timestamp = start
            ? new Date(loggedTime - startTime).toISOString().substr(11, 8)
            : '[?]';
        return `${timestamp} (${cmt.author}) ${cmt.body}`;
    })
        .join('\n');
}
exports.filterAndStringifyHistory = filterAndStringifyHistory;
function deleteGuildSettings(g) {
    if (exports.guildSettingsEnmap.has(g))
        exports.guildSettingsEnmap.delete(g);
}
exports.deleteGuildSettings = deleteGuildSettings;
//// PRIVATE //////////////////////////////////////////////////////////////////
function getGuildSettings(g) {
    const _id = (0, discord_1.isGuild)(g) ? g.id : g;
    const defaults = {
        _id,
        admins: [], blacklist: [], blacklisters: [], cameos: [], community: [],
        customWantedPatterns: [], customBannedPatterns: [], deepl: true,
        logChannel: undefined, gossip: [], modMessages: true, relay: [],
        threads: false, twitcasting: [], youtube: []
    };
    return exports.guildSettingsEnmap.ensure(_id, defaults);
}
/** Returns perm levels in descending order (Bot Owner -> User) */
function getPermLevels() {
    return [...config_1.config.permLevels].sort((a, b) => b.level - a.level);
}
function hasPerms(x, roleType) {
    const settings = getSettings(x);
    const roles = settings[roleType];
    return roles.some(role => (0, discord_1.hasRole)(x, role));
}
function isNotBanned(cmt, unwanted, blacklist) {
    return blacklist.every(ytId => ytId !== cmt.ytId)
        && unwanted.every(p => !cmt.body.toLowerCase().includes(p.toLowerCase()));
}
//# sourceMappingURL=guildSettings.js.map