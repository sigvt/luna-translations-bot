"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.community = void 0;
const discord_1 = require("../../helpers/discord");
const common_tags_1 = require("common-tags");
const functions_1 = require("../db/functions");
const ramda_1 = require("ramda");
const usage = 'community <add|remove> <streamer name> <optional:roleID|mention>';
exports.community = {
    config: {
        aliases: ['comm'],
        permLevel: 2
    },
    help: {
        category: 'Notifs',
        usage,
        description: `
      Starts or stops sending community post notifs in the current channel.
    `,
    },
    callback: async (msg, [verb, ...name]) => {
        const role = (0, discord_1.validateRole)(msg.guild, (0, ramda_1.last)(name));
        const streamer = role ? (0, ramda_1.init)(name).join(' ') : name.join(' ');
        (0, functions_1.validateInputAndModifyEntryList)({
            msg, verb, streamer, role, usage,
            feature: 'community',
            add: {
                success: `:family_mmbb: Notifying community posts by`,
                failure: (0, common_tags_1.oneLine) `
          :warning: ${streamer}'s community posts are already being
          relayed in this channel.
        `
            },
            remove: {
                success: `:family_mmbb: Stopped notifying community posts by`,
                failure: (0, common_tags_1.oneLine) `
          :warning: ${streamer}'s community posts weren't already being notified
          in <#${msg.channel.id}>. Are you in the right channel?
        `,
            },
        });
    }
};
//# sourceMappingURL=community.js.map