"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.communityEmitter = void 0;
const events_1 = __importDefault(require("events"));
const functions_1 = require("../../core/db/functions");
const helpers_1 = require("../../helpers");
const getLatestPost_1 = require("./getLatestPost");
const streamers_1 = require("../../core/db/streamers/");
const tryCatch_1 = require("../../helpers/tryCatch");
exports.communityEmitter = CommunityEmitter();
///////////////////////////////////////////////////////////////////////////////
function CommunityEmitter() {
    const emitter = new events_1.default();
    continuouslyEmitNewPosts(emitter);
    return emitter;
}
async function continuouslyEmitNewPosts(emitter) {
    const allSettings = (0, functions_1.getAllSettings)();
    const subs = (0, helpers_1.removeDupes)(allSettings
        .flatMap(settings => settings.community)
        .map(({ streamer }) => streamers_1.streamers?.find(s => s.name === streamer).ytId));
    for (const ytId of subs) {
        await (0, helpers_1.sleep)(2000);
        await (0, tryCatch_1.asyncTryOrLog)(() => checkChannel(ytId, emitter));
    }
    setTimeout(() => continuouslyEmitNewPosts(emitter), 2000);
}
async function checkChannel(ytId, emitter) {
    const notified = (0, functions_1.getNotifiedCommunityPosts)();
    const post = await (0, getLatestPost_1.getLatestPost)(ytId);
    const mustEmit = post && !notified.includes(post.url) && post.isToday;
    if (mustEmit) {
        (0, functions_1.addNotifiedCommunityPost)(post.url);
        emitter.emit('post', post);
    }
}
//# sourceMappingURL=communityEmitter.js.map