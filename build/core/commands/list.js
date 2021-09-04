"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = void 0;
const discord_1 = require("../../helpers/discord");
const streamers_1 = require("../db/streamers/");
exports.list = {
    config: {
        aliases: ['streamers', 'idols', 'vtubers', 'channels', 'l'],
        permLevel: 0
    },
    help: {
        category: 'General',
        usage: 'list',
        description: 'Lists supported YT channels.',
    },
    callback: (msg) => {
        (0, discord_1.reply)(msg, (0, discord_1.createEmbed)({
            title: 'Supported channels',
            description: (0, streamers_1.getStreamerList)()
        }));
    }
};
//# sourceMappingURL=list.js.map