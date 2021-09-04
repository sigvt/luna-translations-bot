"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cameos = void 0;
const discord_1 = require("../../helpers/discord");
const common_tags_1 = require("common-tags");
const functions_1 = require("../db/functions");
const usage = 'cameos <add|remove> <streamer name>';
exports.cameos = {
    config: {
        aliases: ['holochats'],
        permLevel: 2
    },
    help: {
        category: 'Notifs',
        usage,
        description: (0, common_tags_1.oneLine) `
      Start or stop relaying a streamer's appearances in other
      streamers' livechat.
    `,
    },
    callback: (msg, [verb, ...name]) => {
        const streamer = name.join(' ');
        (0, functions_1.validateInputAndModifyEntryList)({
            msg, verb, streamer, usage,
            feature: 'cameos',
            add: {
                success: `${discord_1.emoji.holo} Relaying cameos in other chats`,
                failure: (0, common_tags_1.oneLine) `
          :warning: ${streamer}'s cameos in other chats already being
          relayed in this channel.
        `
            },
            remove: {
                success: `${discord_1.emoji.holo} Stopped relaying chat cameos`,
                failure: (0, common_tags_1.oneLine) `
          :warning: ${streamer}'s cameos' weren't already being relayed
          in <#${msg.channel.id}>. Are you in the right channel?
        `,
            },
        });
    }
};
//# sourceMappingURL=cameos.js.map