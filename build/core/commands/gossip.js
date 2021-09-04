"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gossip = void 0;
const discord_1 = require("../../helpers/discord");
const common_tags_1 = require("common-tags");
const functions_1 = require("../db/functions");
const usage = 'gossip <add|remove> <streamer name>';
exports.gossip = {
    config: {
        aliases: [],
        permLevel: 2
    },
    help: {
        category: 'Notifs',
        usage,
        description: (0, common_tags_1.oneLine) `
      Start or stop relaying a streamer's mentions in other
      streamers' livechat (includes translations and streamer comments).
    `,
    },
    callback: (msg, [verb, ...name]) => {
        const streamer = name.join(' ');
        (0, functions_1.validateInputAndModifyEntryList)({
            msg, verb, streamer, usage,
            feature: 'gossip',
            add: {
                success: `${discord_1.emoji.peek} Relaying gossip other chats`,
                failure: (0, common_tags_1.oneLine) `
          :warning: Gossip about ${streamer} in other chats already being
          relayed in this channel.
        `
            },
            remove: {
                success: `${discord_1.emoji.holo} Stopped relaying gossip`,
                failure: (0, common_tags_1.oneLine) `
          :warning: Gossip about ${streamer} wasn't already being relayed
          in <#${msg.channel.id}>. Are you in the right channel?
        `,
            },
        });
    }
};
//# sourceMappingURL=gossip.js.map