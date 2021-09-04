"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.relay = void 0;
const discord_1 = require("../../helpers/discord");
const common_tags_1 = require("common-tags");
const functions_1 = require("../db/functions");
const ramda_1 = require("ramda");
const usage = 'relay <add|remove|clear> <streamer name> <optional:roleID|mention>';
exports.relay = {
    config: {
        aliases: ['subscribe', 'sub', 'r', 'watch'],
        permLevel: 2
    },
    help: {
        category: 'Relay',
        usage,
        description: (0, common_tags_1.oneLine) `
      Start or stop relaying a streamer's translations (and owner/other
      streamer messages), in the current Discord channel.
    `,
    },
    callback: (msg, [verb, ...name]) => {
        const role = (0, discord_1.validateRole)(msg.guild, (0, ramda_1.last)(name));
        const streamer = role ? (0, ramda_1.init)(name).join(' ') : name.join(' ');
        (0, functions_1.validateInputAndModifyEntryList)({
            msg, verb, streamer, role, usage,
            feature: 'relay',
            add: {
                success: `:speech_balloon: Relaying TLs for`,
                failure: `
           :warning: ${streamer} is already being relayed in this channel
        `
            },
            remove: {
                success: `:speech_balloon: Stopped relaying TLs for`,
                failure: (0, common_tags_1.oneLine) `
          :warning: ${streamer}'s translations weren't already being relayed
          in <#${msg.channel.id}>. Are you in the right channel?
        `,
            },
        });
    }
};
//# sourceMappingURL=relay.js.map