"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logCommentData = void 0;
const helpers_1 = require("../../helpers");
const commentBooleans_1 = require("./commentBooleans");
function logCommentData(cmt, frame, streamer) {
    const templates = {
        owner: `Owner: ${cmt.name} | ${frame.id}`,
        mod: `Mod: ${cmt.name} | ${streamer.name} | ${frame.id}`,
        tl: `TL: ${cmt.name} | ${streamer.name} | ${frame.id}`,
        cameo: `Cameo: ${cmt.name} | ${frame.channel.name} (${frame.id})`
    };
    if (cmt.isOwner)
        return (0, helpers_1.log)(templates.owner);
    if ((0, commentBooleans_1.isStreamer)(cmt.id))
        return (0, helpers_1.log)(templates.cameo);
    if ((0, commentBooleans_1.isTl)(cmt.body))
        return (0, helpers_1.log)(templates.tl);
    if (cmt.isMod)
        return (0, helpers_1.log)(templates.mod);
}
exports.logCommentData = logCommentData;
//# sourceMappingURL=logging.js.map