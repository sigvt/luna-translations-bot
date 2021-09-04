"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
const ramda_1 = require("ramda");
const config_1 = require("../../config");
const discord_1 = require("../../helpers/discord");
const frames_1 = require("../../modules/holodex/frames");
const functions_1 = require("../db/functions");
exports.log = {
    config: {
        aliases: ['history', 'tlLog', 'relayLog'],
        permLevel: 0
    },
    help: {
        category: 'Relay',
        usage: 'log <video ID>',
        description: 'Posts the archived relay log for a given video ID.'
    },
    callback: async (msg, args) => {
        const videoId = (0, ramda_1.head)(args);
        const history = await (0, functions_1.getRelayHistory)(videoId);
        const processMsg = (0, ramda_1.isEmpty)(args) ? showHelp
            : !history ? notifyLogNotFound
                : sendLog;
        processMsg(msg, videoId, history);
    }
};
function showHelp(msg) {
    (0, discord_1.reply)(msg, (0, discord_1.createEmbedMessage)(`
    **Usage:** \`${config_1.config.prefix}${exports.log.help.usage}\`
  `));
}
function notifyLogNotFound(msg, videoId) {
    (0, discord_1.reply)(msg, (0, discord_1.createEmbedMessage)(`Log not found for ${videoId}`));
}
async function sendLog(msg, videoId, history) {
    const start = await (0, frames_1.getStartTime)(videoId);
    const tlLog = (0, functions_1.filterAndStringifyHistory)(msg, history, start);
    (0, discord_1.send)(msg.channel, {
        content: `Here is the TL log for <https://youtu.be/${videoId}>`,
        files: [{ attachment: Buffer.from(tlLog), name: `${videoId}.txt` }]
    });
}
//# sourceMappingURL=log.js.map