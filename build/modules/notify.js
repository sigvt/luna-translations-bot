"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyOneGuild = exports.notifyDiscord = void 0;
const core_1 = require("../core/");
const functions_1 = require("../core/db/functions");
const discord_1 = require("../helpers/discord");
const tryCatch_1 = require("../helpers/tryCatch");
function notifyDiscord(opts) {
    const { streamer, subbedGuilds, feature } = opts;
    const guilds = subbedGuilds ?? (0, functions_1.getSubbedGuilds)(streamer?.name, feature);
    guilds.forEach(g => notifyOneGuild(g, opts));
}
exports.notifyDiscord = notifyDiscord;
async function notifyOneGuild(g, opts) {
    const { streamer, feature, embedBody, emoji } = opts;
    const entries = g[feature].filter(ent => ent.streamer == streamer.name);
    const guildObj = core_1.client.guilds.cache.find(guild => guild.id === g._id);
    const notices = (0, functions_1.getRelayNotices)(g._id);
    const announce = notices.get(opts.videoId ?? '');
    return !announce ? Promise.all(entries.map(({ discordCh, roleToNotify }) => {
        const ch = guildObj?.channels.cache
            .find(ch => ch.id === discordCh);
        return (0, discord_1.send)(ch, {
            content: `${roleToNotify ? emoji + ' <@&' + roleToNotify + '>' : ''} `,
            embeds: [(0, discord_1.createEmbed)({
                    author: { name: streamer.name, iconURL: opts.avatarUrl },
                    thumbnail: { url: opts.avatarUrl },
                    description: embedBody
                })]
        })
            .then(msg => {
            if (msg && feature === 'relay') {
                const ch = msg.channel;
                const mustThread = (0, discord_1.canBot)('USE_PUBLIC_THREADS', ch) && g.threads;
                (0, functions_1.addRelayNotice)(g._id, opts.videoId, msg.id);
                if (mustThread)
                    return (0, tryCatch_1.tryOrLog)(() => ch.threads?.create({
                        name: `Log ${streamer.name} ${opts.videoId}`,
                        startMessage: msg,
                        autoArchiveDuration: 1440
                    }))
                        ?.then(thread => {
                        if (thread && (0, discord_1.canBot)('MANAGE_MESSAGES', ch)) {
                            (0, tryCatch_1.tryOrLog)(() => msg.pin());
                            setTimeout(() => (0, tryCatch_1.tryOrLog)(() => msg?.unpin()), 86400000);
                        }
                    });
            }
        });
    })) : [];
}
exports.notifyOneGuild = notifyOneGuild;
//# sourceMappingURL=notify.js.map