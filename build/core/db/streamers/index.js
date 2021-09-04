"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSupported = exports.replyStreamerList = exports.getTwitterUsername = exports.findStreamerName = exports.getStreamerList = exports.twitters = exports.names = exports.streamers = void 0;
/** @file Exports main streamer list and streamer-related utility functions */
const discord_js_1 = require("discord.js");
const helpers_1 = require("../../../helpers");
const discord_1 = require("../../../helpers/discord");
const hololive_1 = require("./hololive");
const indies_1 = require("./indies");
const nijisanji_1 = require("./nijisanji");
exports.streamers = StreamerArray([
    ...hololive_1.hololive,
    ...nijisanji_1.nijisanji,
    ...indies_1.indies
]);
exports.names = exports.streamers.map(x => x.name);
exports.twitters = exports.streamers.map(x => x.twitter);
function getStreamerList() {
    return exports.streamers.map(streamer => streamer.name).join(', ');
}
exports.getStreamerList = getStreamerList;
function findStreamerName(name) {
    const bySubname = exports.streamers.find(s => s.name.split(' ').some(word => (0, helpers_1.ciEquals)(word, name)));
    const byFullName = exports.streamers.find(s => s.name === name);
    const byAlias = exports.streamers.find(s => s.aliases?.some(a => typeof a === 'string' ? (0, helpers_1.ciEquals)(a, name) : name.match(a)));
    const streamer = bySubname ?? byFullName ?? byAlias;
    return name === 'all' ? 'all' : streamer?.name;
}
exports.findStreamerName = findStreamerName;
function getTwitterUsername(streamer) {
    return exports.streamers.find(x => x.name === streamer)?.twitter ?? 'discord';
}
exports.getTwitterUsername = getTwitterUsername;
function replyStreamerList(x) {
    const msg = x instanceof discord_js_1.Message ? x : x.msg;
    (0, discord_1.reply)(msg, (0, discord_1.createEmbed)({
        title: 'Supported channels',
        description: getStreamerList()
    }));
}
exports.replyStreamerList = replyStreamerList;
function isSupported(ytId) {
    return exports.streamers.some(streamer => streamer.ytId === ytId);
}
exports.isSupported = isSupported;
//////////////////////////////////////////////////////////////////////////////
/**
 * This constrained identity function validates array without typing it
 * so that we may use 'as const' on the array
 **/
function StreamerArray(arr) {
    return arr;
}
// type stringOrRegex = string | RegExp
//# sourceMappingURL=index.js.map