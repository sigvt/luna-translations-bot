"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const config_1 = require("../config");
const functions_1 = require("../core/db/functions");
const streamers_1 = require("../core/db/streamers");
const discord_1 = require("../helpers/discord");
const tryCatch_1 = require("../helpers/tryCatch");
const notify_1 = require("./notify");
const { twitcastingId, twitcastingSecret } = config_1.config;
initTwitcast();
function initTwitcast() {
    const socket = new ws_1.default(`wss://${twitcastingId}:${twitcastingSecret}@realtime.twitcasting.tv/lives`);
    socket.on('error', socket.close);
    socket.on('close', initTwitcast);
    socket.on('message', processMessage);
}
async function processMessage(data) {
    const json = (0, tryCatch_1.tryOrLog)(() => JSON.parse(data));
    const lives = json?.movies?.map(processPayloadEntry);
    const settings = (0, functions_1.getAllSettings)();
    lives?.forEach(live => notifyLive(live, settings));
}
function processPayloadEntry(message) {
    return ({
        name: message.broadcaster?.screen_id,
        movieId: message.movie?.id
    });
}
async function notifyLive(live, settings) {
    return (0, notify_1.notifyDiscord)({
        avatarUrl: '',
        subbedGuilds: settings.filter(g => isRelaying(g, live.name)),
        feature: 'twitcasting',
        streamer: streamers_1.streamers.find(x => x.twitter === live.name),
        emoji: discord_1.emoji.tc,
        embedBody: `
      I am live on Twitcasting!
      https://twitcasting.tv/${live.name}/movie/${live.movieId}
    `,
    });
}
function isRelaying(guild, streamer) {
    return guild
        .twitcasting
        .some(entry => streamer === (0, streamers_1.getTwitterUsername)(entry.streamer));
}
//# sourceMappingURL=twitcastingNotifier.js.map