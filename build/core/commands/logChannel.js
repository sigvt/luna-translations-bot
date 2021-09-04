"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logChannel = void 0;
const ramda_1 = require("ramda");
const discord_1 = require("../../helpers/discord");
const functions_1 = require("../db/functions");
const lunaBotClient_1 = require("../lunaBotClient");
exports.logChannel = {
    config: {
        aliases: ['logchannel', 'logch', 'logCh'],
        permLevel: 2
    },
    help: {
        category: 'Relay',
        usage: 'logChannel <optional: channel>',
        description: 'Redirect TL logs to specified channel, or clear the setting.'
    },
    callback: async (msg, args) => {
        const channelMention = (0, ramda_1.head)(args);
        const channelId = channelMention?.match(/<#(.*?)>/)?.[1];
        const channelObj = lunaBotClient_1.client.channels.cache.find(c => c.id === channelId);
        const processMsg = (0, ramda_1.isEmpty)(args) ? clearSetting
            : (0, ramda_1.isNil)(channelObj) ? respondInvalid
                : setLogChannel;
        processMsg(msg, channelId);
    }
};
function clearSetting(msg) {
    (0, functions_1.updateSettings)(msg, { logChannel: undefined });
    (0, discord_1.reply)(msg, (0, discord_1.createEmbedMessage)('Logs will be posted in the relay channel.'));
}
function respondInvalid(msg) {
    (0, discord_1.reply)(msg, (0, discord_1.createEmbedMessage)(`Invalid channel supplied.`));
}
function setLogChannel(msg, channelId) {
    (0, functions_1.updateSettings)(msg, { logChannel: channelId });
    (0, discord_1.reply)(msg, (0, discord_1.createEmbedMessage)(`Logs will be posted in <#${channelId}>.`));
}
//# sourceMappingURL=logChannel.js.map