"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.twitcast = void 0;
const discord_1 = require("../../helpers/discord");
const common_tags_1 = require("common-tags");
const functions_1 = require("../db/functions");
const ramda_1 = require("ramda");
const usage = 'twitcast <add|remove> <streamer name> <optional:roleID|mention>';
exports.twitcast = {
    config: {
        aliases: ['tc', 'twitcasting'],
        permLevel: 2
    },
    help: {
        category: 'Notifs',
        usage,
        description: (0, common_tags_1.oneLine) `
      Starts or stops sending twitcasting livestream notifs
      in the current channel.
    `,
    },
    callback: async (msg, [verb, ...name]) => {
        const role = (0, discord_1.validateRole)(msg.guild, (0, ramda_1.last)(name));
        const streamer = role ? (0, ramda_1.init)(name).join(' ') : name.join(' ');
        (0, functions_1.validateInputAndModifyEntryList)({
            msg, verb, streamer, role, usage,
            feature: 'twitcasting',
            add: {
                success: `${discord_1.emoji.tc} Notifying twitcasting lives for`,
                failure: (0, common_tags_1.oneLine) `
          :warning: ${streamer}'s twitcasting lives are already being
          relayed in this channel.
        `
            },
            remove: {
                success: `${discord_1.emoji.tc} Stopped notifying twitcasting lives by`,
                failure: (0, common_tags_1.oneLine) `
          :warning: ${streamer}'s twitcasting lives weren't already being
          notified in <#${msg.channel.id}>. Are you in the right channel?
        `,
            },
        });
    }
};
//# sourceMappingURL=twitcast.js.map