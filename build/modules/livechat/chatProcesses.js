"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteChatProcess = exports.chatProcessExists = exports.getChatProcess = void 0;
const child_process_1 = require("child_process");
/** Returns a singleton of the chat process for a given video ID */
function getChatProcess(videoId) {
    return chatProcesses[videoId] ??= spawnChatProcess(videoId);
}
exports.getChatProcess = getChatProcess;
function chatProcessExists(videoId) {
    return chatProcesses[videoId] != undefined;
}
exports.chatProcessExists = chatProcessExists;
function deleteChatProcess(videoId) {
    delete chatProcesses[videoId];
}
exports.deleteChatProcess = deleteChatProcess;
const chatProcesses = {};
function spawnChatProcess(liveId) {
    return (0, child_process_1.spawn)('python3', ['-u', './modules/livechat/chat_dl.py', liveId]);
}
//# sourceMappingURL=chatProcesses.js.map