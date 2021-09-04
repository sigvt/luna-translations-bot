"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findFrameThread = exports.setupRelay = void 0;
const helpers_1 = require("../../helpers");
const tryCatch_1 = require("../../helpers/tryCatch");
const frames_1 = require("../holodex/frames");
const chatProcesses_1 = require("./chatProcesses");
const streamers_1 = require("../../core/db/streamers");
const discord_1 = require("../../helpers/discord");
const deepl_1 = require("../deepl");
const functions_1 = require("../../core/db/functions");
const commentBooleans_1 = require("./commentBooleans");
const closeHandler_1 = require("./closeHandler");
const logging_1 = require("./logging");
const youtubeNotifier_1 = require("../youtubeNotifier");
const notify_1 = require("../notify");
const frameEmitter_1 = require("../holodex/frameEmitter");
frameEmitter_1.frameEmitter.on('frame', (frame) => {
    if ((0, frames_1.isPublic)(frame))
        setupRelay(frame);
});
function setupRelay(frame) {
    const chat = (0, chatProcesses_1.getChatProcess)(frame.id);
    chat.stdout.removeAllListeners('data');
    chat.stdout.on('data', data => processComments(frame, data));
    chat.removeAllListeners('close');
    chat.on('close', exitCode => (0, closeHandler_1.retryIfStillUpThenPostLog)(frame, exitCode));
}
exports.setupRelay = setupRelay;
///////////////////////////////////////////////////////////////////////////////
let guilds = []; // Simple caching
setInterval(() => guilds = (0, functions_1.getAllSettings)(), 5000);
async function processComments(frame, data) {
    for (const cmt of extractComments(data)) {
        const features = ['relay', 'cameos', 'gossip'];
        const streamer = streamers_1.streamers.find(s => s.ytId === frame.channel.id);
        const author = streamers_1.streamers.find(s => s.ytId === cmt.id);
        const isCameo = (0, commentBooleans_1.isStreamer)(cmt.id) && !cmt.isOwner;
        const mustDeepL = (0, commentBooleans_1.isStreamer)(cmt.id) && !(0, commentBooleans_1.isHoloID)(streamer);
        const deepLTl = mustDeepL ? await (0, deepl_1.tl)(cmt.body) : undefined;
        const mustShowTl = mustDeepL && deepLTl !== cmt.body;
        const getWatched = (f) => f === 'cameos' ? author : streamer;
        const maybeGossip = (0, commentBooleans_1.isStreamer)(cmt.id) || (0, commentBooleans_1.isTl)(cmt.body);
        const entries = guilds.flatMap(g => features.flatMap(f => getRelayEntries(g, f, getWatched(f)?.name).map(e => [g, f, e])));
        (0, logging_1.logCommentData)(cmt, frame, streamer);
        if ((0, commentBooleans_1.isTl)(cmt.body) || (0, commentBooleans_1.isStreamer)(cmt.id))
            saveComment(cmt, frame, 'bot');
        entries.forEach(([g, f, e]) => {
            const relayCmt = (0, helpers_1.match)(f, {
                cameos: isCameo ? relayCameo : helpers_1.doNothing,
                gossip: maybeGossip ? relayGossip : helpers_1.doNothing,
                relay: relayTlOrStreamerComment
            });
            relayCmt({
                e, cmt, frame, g,
                discordCh: (0, discord_1.findTextChannel)(e.discordCh),
                deepLTl: mustShowTl ? deepLTl : undefined,
                to: streamer?.name ?? 'Discord',
            });
        });
    }
}
function relayCameo({ discordCh, to, cmt, deepLTl, frame }, isGossip) {
    const cleaned = cmt.body.replaceAll('`', "'");
    const emj = isGossip ? discord_1.emoji.peek : discord_1.emoji.holo;
    const line1 = `${emj} **${cmt.name}** in **${to}**'s chat: \`${cleaned}\``;
    const line2 = deepLTl ? `\n${discord_1.emoji.deepl}**DeepL:** \`${deepLTl}\`` : '';
    const line3 = `\n<https://youtu.be/${frame.id}>`;
    (0, discord_1.send)(discordCh, line1 + line2 + line3);
}
function relayGossip(data) {
    const stalked = streamers_1.streamers.find(s => s.name === data.e.streamer);
    if (isGossip(data.cmt.body, stalked, data.frame))
        relayCameo(data, true);
}
function relayTlOrStreamerComment({ discordCh, deepLTl, cmt, g, frame }) {
    const mustPost = cmt.isOwner
        || ((0, commentBooleans_1.isTl)(cmt.body, g) && !(0, commentBooleans_1.isBlacklistedOrUnwanted)(cmt, g))
        || (0, commentBooleans_1.isStreamer)(cmt.id)
        || (cmt.isMod && g.modMessages && !(0, commentBooleans_1.isBlacklistedOrUnwanted)(cmt, g));
    const premoji = (0, commentBooleans_1.isTl)(cmt.body, g) ? ':speech_balloon:'
        : (0, commentBooleans_1.isStreamer)(cmt.id) ? discord_1.emoji.holo
            : ':tools:';
    const url = frame.status === 'live' ? ''
        : deepLTl ? `\n<https://youtu.be/${frame.id}>`
            : ` | <https://youtu.be/${frame.id}>`;
    const author = (0, commentBooleans_1.isTl)(cmt.body, g) ? `||${cmt.name}:||` : `**${cmt.name}:**`;
    const text = cmt.body.replaceAll('`', "''");
    const tl = deepLTl ? `\n${discord_1.emoji.deepl}**DeepL:** \`${deepLTl}\`` : '';
    if (mustPost) {
        // I haven't checked yet if this causes spam so i'll be keeping it disabled
        // announceIfNotDone (frame, g._id)
        const thread = findFrameThread(frame.id, g, discordCh);
        (0, discord_1.send)(thread ?? discordCh, `${premoji} ${author} \`${text}\`${tl}${url}`)
            .then(msg => saveComment(cmt, frame, 'guild', g._id, msg))
            .catch(helpers_1.debug);
    }
}
function findFrameThread(videoId, g, channel) {
    const gdata = (0, functions_1.getGuildData)(g._id);
    const notice = gdata.relayNotices.get(videoId);
    const validch = channel;
    if (g.threads)
        return validch?.threads?.cache.find(thr => thr.id === notice);
}
exports.findFrameThread = findFrameThread;
function announceIfNotDone(frame, gid) {
    const notices = (0, functions_1.getRelayNotices)(gid);
    const announce = notices.get(frame.id);
    const g = (0, functions_1.getSettings)(gid);
    const mustNotify = !announce && frame.status === 'live';
    return mustNotify ? (0, notify_1.notifyOneGuild)(g, {
        subbedGuilds: [g], ...(0, youtubeNotifier_1.getRelayNotifyProps)(frame)
    }) : Promise.resolve([]);
}
function saveComment(cmt, frame, type, gid, msg) {
    const addFn = type === 'guild' ? functions_1.addToGuildRelayHistory : helpers_1.doNothing;
    const startTime = new Date(Date.parse(frame.start_actual ?? '')).valueOf();
    const loggedTime = new Date(+cmt.time).valueOf();
    const timestamp = !frame.start_actual
        ? 'prechat'
        : new Date(loggedTime - startTime)
            .toISOString()
            .substr(11, 8);
    addFn(frame.id, {
        msgId: msg?.id,
        discordCh: msg?.channel.id,
        body: cmt.body,
        ytId: cmt.id,
        author: cmt.name,
        timestamp,
        stream: frame.id,
        absoluteTime: cmt.time
    }, gid);
}
function extractComments(jsonl) {
    const cmts = String(jsonl)
        .split('\n')
        .filter(x => x !== '');
    return (0, tryCatch_1.tryOrDefault)(() => cmts.map(cmt => JSON.parse(cmt)), []);
}
function getRelayEntries(g, f, streamer) {
    return f === 'gossip' ? g[f] : g[f]
        .filter(entry => entry.streamer === streamer || entry.streamer === 'all');
}
function isGossip(text, stalked, frame) {
    const isOwnChannel = frame.channel.id === stalked.ytId;
    const isCollab = [stalked.twitter, stalked.ytId, stalked.name, stalked.chName]
        .some(str => frame.description.includes(str));
    const mentionsWatched = text
        .replace(/[,()]|'s/g, '')
        .split(' ')
        .some(w => stalked.aliases.some(a => (0, helpers_1.ciEquals)(a, w)));
    return !isOwnChannel && !isCollab && mentionsWatched;
}
//# sourceMappingURL=chatRelayer.js.map