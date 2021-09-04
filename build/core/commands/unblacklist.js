"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unblacklist = void 0;
const discord_1 = require("../../helpers/discord");
const common_tags_1 = require("common-tags");
const functions_1 = require("../db/functions");
const ramda_1 = require("ramda");
exports.unblacklist = {
    config: {
        aliases: ['ub', 'unb', 'unbl'],
        permLevel: 1
    },
    help: {
        category: 'Relay',
        usage: 'unblacklist <optional channel ID>',
        description: (0, common_tags_1.oneLine) `
      Unblacklists the specified channel ID.
      If none specified, unblacklists last item.
    `,
    },
    callback: (msg, args) => {
        const processMsg = (0, ramda_1.isEmpty)(args) ? unblacklistLastItem
            : unblacklistItem;
        processMsg(msg, (0, ramda_1.head)(args));
    }
};
///////////////////////////////////////////////////////////////////////////////
function unblacklistLastItem(msg) {
    const { blacklist } = (0, functions_1.getSettings)(msg);
    const lastBlacklisted = (0, ramda_1.last)(blacklist);
    const replyContent = lastBlacklisted
        ? (0, common_tags_1.oneLine) `
      :white_check_mark: Successfully unblacklisted channel
      ${lastBlacklisted.ytId} (${lastBlacklisted.name}).
    `
        : ':warning: No items in blacklist.';
    (0, discord_1.reply)(msg, (0, discord_1.createEmbedMessage)(replyContent));
    if (lastBlacklisted)
        (0, functions_1.updateSettings)(msg, { blacklist: (0, ramda_1.init)(blacklist) });
}
function unblacklistItem(msg, ytId) {
    const success = (0, functions_1.removeBlacklisted)(msg.guild, ytId);
    (0, discord_1.reply)(msg, (0, discord_1.createEmbedMessage)(success
        ? `:white_check_mark: Successfully unblacklisted ${ytId}.`
        : `:warning: YouTube channel ID ${ytId} was not found.`));
}
//# sourceMappingURL=unblacklist.js.map