"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const core_1 = require("../../core");
const functions_1 = require("../../core/db/functions");
const streamers_1 = require("../../core/db/streamers");
const discord_1 = require("../../helpers/discord");
const communityEmitter_1 = require("./communityEmitter");
const worker_threads_1 = require("worker_threads");
if (worker_threads_1.isMainThread)
    communityEmitter_1.communityEmitter.on('post', notifyPost);
function notifyPost(post) {
    const allSettings = (0, functions_1.getAllSettings)();
    const streamer = streamers_1.streamers.find(s => s.ytId == post.ytId);
    const guilds = allSettings.filter(g => follows(streamer.name, g));
    const subs = guilds.flatMap(g => getSubs(g, streamer.name).map(s => [g, s]));
    subs.forEach(([g, { streamer, discordCh, roleToNotify }]) => {
        const guild = core_1.client.guilds.cache.find(gg => gg.id === g._id);
        const ch = guild?.channels.cache
            .find(ch => ch.id == discordCh);
        (0, discord_1.send)(ch, {
            content: (0, common_tags_1.oneLine) `
        :loudspeaker: ${roleToNotify ? '<@&' + roleToNotify + '>' : ''}
        ${streamer} just published a community post!\n
        ${post.url}
      `,
            embeds: [(0, discord_1.createEmbed)({
                    url: post.url,
                    author: { name: post.author, iconURL: post.avatar, url: post.url },
                    description: post.content,
                    thumbnail: { url: post.avatar }
                })]
        });
    });
}
function follows(streamer, settings) {
    return settings.community.map(el => el.streamer).includes(streamer);
}
function getSubs(g, s) {
    return g.community.filter(e => e.streamer === s);
}
//# sourceMappingURL=communityNotifier.js.map