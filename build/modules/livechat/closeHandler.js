"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryIfStillUpThenPostLog = void 0;
const functions_1 = require("../../core/db/functions");
const helpers_1 = require("../../helpers");
const discord_1 = require("../../helpers/discord");
const frames_1 = require("../holodex/frames");
const chatProcesses_1 = require("./chatProcesses");
const chatRelayer_1 = require("./chatRelayer");
async function retryIfStillUpThenPostLog(frame, exitCode) {
    const allFrames = await (0, frames_1.getFrameList)();
    const isStillOn = allFrames?.some(frame_ => frame_.id === frame.id);
    (0, chatProcesses_1.deleteChatProcess)(frame.id);
    retries[frame.id] = (retries[frame.id] ?? 0) + 1;
    if (isStillOn && retries[frame.id] <= 5) {
        (0, helpers_1.debug)(`Pytchat crashed on ${frame.id}, trying to reconnect in 5s`);
        setTimeout(() => (0, chatRelayer_1.setupRelay)(frame), 5000);
    }
    else {
        (0, helpers_1.log)(`${frame.status} ${frame.id} closed with exit code ${exitCode}`);
        delete retries[frame.id];
        sendAndForgetHistory(frame.id);
    }
}
exports.retryIfStillUpThenPostLog = retryIfStillUpThenPostLog;
////////////////////////////////////////////////////////////////////////////////
const retries = {};
async function sendAndForgetHistory(videoId) {
    const relevantHistories = (0, functions_1.getAllRelayHistories)()
        .map(history => history.get(videoId))
        .filter(helpers_1.isNotNil);
    relevantHistories.forEach(async (history, gid) => {
        const g = (0, functions_1.getSettings)(gid);
        const setCh = (0, discord_1.findTextChannel)(g.logChannel);
        const ch = (0, discord_1.findTextChannel)(history[0].discordCh);
        const thread = (0, chatRelayer_1.findFrameThread)(videoId, g, ch);
        const start = await (0, frames_1.getStartTime)(videoId);
        const tlLog = (0, functions_1.filterAndStringifyHistory)(gid, history, start);
        (0, functions_1.deleteRelayHistory)(videoId, gid);
        (0, discord_1.send)(setCh ?? thread ?? ch, {
            content: `Here is this stream's TL log. <https://youtu.be/${videoId}>`,
            files: [{ attachment: Buffer.from(tlLog), name: `${videoId}.txt` }]
        });
    });
}
//# sourceMappingURL=closeHandler.js.map