"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blacklist = void 0;
const discord_1 = require("../../helpers/discord");
const common_tags_1 = require("common-tags");
const functions_1 = require("../db/functions");
const commentBooleans_1 = require("../../modules/livechat/commentBooleans");
exports.blacklist = {
    config: {
        aliases: ['bl', 'block'],
        permLevel: 1
    },
    help: {
        category: 'Relay',
        usage: 'blacklist <optional reason> (as reply)',
        description: (0, common_tags_1.oneLine) `
      Shows blacklist, or blacklists the YouTube channel
      of the translation that this command is in reply to.
    `,
    },
    callback: async (msg, args) => {
        const reason = args.join(' ').trim() || 'No reason provided.';
        const isReply = msg.reference != null;
        const processMsg = isReply ? blacklistTl : showHelp;
        processMsg(msg, reason);
    }
};
//////////////////////////////////////////////////////////////////////////////
function blacklistTl(msg, reason) {
    const settings = (0, functions_1.getSettings)(msg.guild);
    const refId = msg.reference.messageId;
    const history = (0, functions_1.getFlatGuildRelayHistory)(msg.guild);
    const culprit = history.find(cmt => cmt.msgId === refId);
    const duplicate = culprit && (0, commentBooleans_1.isBlacklisted)(culprit.ytId, settings);
    const callback = duplicate ? notifyDuplicate
        : culprit ? addBlacklistedAndConfirm
            : notifyTranslatorNotFound;
    callback(msg, culprit, reason);
}
function showHelp(msg) {
    const g = (0, functions_1.getSettings)(msg);
    const header = 'Channel ID               | Name (Reason)\n';
    const entries = g.blacklist.map(e => `${e.ytId} | ${e.name} (${e.reason})`)
        .join('\n');
    const list = header + entries;
    (0, discord_1.reply)(msg, (0, discord_1.createEmbed)({ fields: [{
                name: ':no_entry: Blacklisting someone',
                value: 'Run this command as a Discord reply to the target translation.',
                inline: false
            }, {
                name: ':white_check_mark: Unblacklisting someone',
                value: (0, common_tags_1.oneLine) `
      Run \`tl.unblacklist\` to unblacklist the last item,
      or \`tl.unblacklist <channel ID>\` to unblacklist a
      specific YouTube channel.
    `,
                inline: false
            }] }), '', (0, discord_1.createTxtEmbed)('blacklist.txt', list));
}
function notifyDuplicate(msg) {
    (0, discord_1.reply)(msg, (0, discord_1.createEmbedMessage)(':warning: Already blacklisted'));
}
function addBlacklistedAndConfirm(msg, { ytId, author }, reason) {
    (0, functions_1.addBlacklisted)(msg.guild, { ytId: ytId, name: author, reason });
    (0, discord_1.reply)(msg, (0, discord_1.createEmbed)({ fields: [{
                name: ':no_entry: Blacklister',
                value: msg.author.toString(),
                inline: true,
            }, {
                name: ':clown: Blacklisted channel',
                value: author,
                inline: true,
            }, {
                name: ':bookmark_tabs: Reason',
                value: reason,
                inline: true,
            }] }));
}
function notifyTranslatorNotFound(msg) {
    (0, discord_1.reply)(msg, (0, discord_1.createEmbedMessage)(':warning: Translator data not found.'));
}
//# sourceMappingURL=blacklist.js.map