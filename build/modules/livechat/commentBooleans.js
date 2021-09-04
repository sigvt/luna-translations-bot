"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStreamer = exports.isHoloID = exports.isBlacklisted = exports.isUnwanted = exports.isBlacklistedOrUnwanted = exports.isWanted = exports.isTl = void 0;
const streamers_1 = require("../../core/db/streamers");
const tlPatterns = [
    /[\S]+ tl[:)\]\】\］]/i,
    /([(\[/\［\【]|^)(tl|eng?)[\]):\】\］]/i,
    /^[\[(](eng?|tl)/i, // TLs who forget closing bracket
];
function isTl(cmt, g) {
    return tlPatterns.some(pattern => pattern.test(cmt))
        || (g !== undefined && isWanted(cmt, g));
}
exports.isTl = isTl;
function isWanted(cmt, g) {
    return g.customWantedPatterns
        .some(pattern => cmt.toLowerCase().startsWith(pattern.toLowerCase()));
}
exports.isWanted = isWanted;
function isBlacklistedOrUnwanted(cmt, g) {
    return isBlacklisted(cmt.id, g) || isUnwanted(cmt.body, g);
}
exports.isBlacklistedOrUnwanted = isBlacklistedOrUnwanted;
function isUnwanted(cmt, g) {
    return g.customBannedPatterns
        .some(pattern => cmt.toLowerCase().includes(pattern.toLowerCase()));
}
exports.isUnwanted = isUnwanted;
function isBlacklisted(ytId, g) {
    return g.blacklist.map(x => x.ytId).includes(ytId);
}
exports.isBlacklisted = isBlacklisted;
function isHoloID(streamer) {
    return streamer?.groups.some(g => g.includes('Indonesia'));
}
exports.isHoloID = isHoloID;
function isStreamer(ytId) {
    return streamers_1.streamers.some(s => s.ytId === ytId);
}
exports.isStreamer = isStreamer;
//# sourceMappingURL=commentBooleans.js.map