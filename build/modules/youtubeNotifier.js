"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelayNotifyProps = void 0;
const functions_1 = require("../core/db/functions");
const streamers_1 = require("../core/db/streamers");
const helpers_1 = require("../helpers");
const discord_1 = require("../helpers/discord");
const notify_1 = require("./notify");
const frameEmitter_1 = require("./holodex/frameEmitter");
frameEmitter_1.frameEmitter.on('frame', notifyFrame);
async function notifyFrame(frame) {
    const streamer = streamers_1.streamers.find(s => s.ytId === frame.channel.id);
    const isRecorded = (0, functions_1.getNotifiedLives)().includes(frame.id);
    const isNew = streamer && !isRecorded;
    const mustNotify = isNew && frame.status === 'live';
    if (isNew)
        (0, helpers_1.log)(`${frame.status} | ${frame.id} | ${streamer.name}`);
    if (mustNotify) {
        (0, notify_1.notifyDiscord)({
            feature: 'youtube',
            streamer: streamer,
            embedBody: `I am live on YouTube!\nhttps://youtu.be/${frame.id}`,
            emoji: discord_1.emoji.yt,
            avatarUrl: frame.channel.photo
        });
        (0, notify_1.notifyDiscord)(getRelayNotifyProps(frame));
        (0, functions_1.addNotifiedLive)(frame.id);
    }
}
function getRelayNotifyProps(frame) {
    return {
        feature: 'relay',
        streamer: streamers_1.streamers.find(s => s.ytId === frame.channel.id),
        embedBody: `
      I will now relay translations from live translators.
      ${frame.title}
      https://youtu.be/${frame.id}
    `,
        emoji: discord_1.emoji.holo,
        videoId: frame.id,
        avatarUrl: frame.channel.photo
    };
}
exports.getRelayNotifyProps = getRelayNotifyProps;
//# sourceMappingURL=youtubeNotifier.js.map