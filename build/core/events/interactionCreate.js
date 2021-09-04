"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interactionCreate = void 0;
const helpers_1 = require("../../helpers");
const discord_1 = require("../../helpers/discord");
const functions_1 = require("../db/functions");
const common_tags_1 = require("common-tags");
const ramda_1 = require("ramda");
const tryCatch_1 = require("../../helpers/tryCatch");
function interactionCreate(intr) {
    if (intr.isButton())
        (0, tryCatch_1.tryOrLog)(() => processButton(intr));
}
exports.interactionCreate = interactionCreate;
///////////////////////////////////////////////////////////////////////////////
function processButton(btn) {
    const notice = (0, functions_1.getNoticeFromMsgId)(btn.guild, btn.message.id);
    const btnHandler = notice ? (0, helpers_1.match)(btn.customId, {
        cancel: cancelBlacklisting,
        cancel2: cancelBlacklistingAndExcludeLine,
        clear: clearAuthorTls
    }) : helpers_1.doNothing;
    btnHandler(btn, notice);
}
async function cancelBlacklisting(btn, notice) {
    const success = (0, functions_1.removeBlacklisted)(btn.guild, notice.ytId);
    (0, tryCatch_1.tryOrLog)(() => btn.update({ components: [], embeds: [
            (0, discord_1.createEmbedMessage)(success
                ? `${notice?.ytId}'s blacklisting has been cancelled.`
                : `Something went wrong unblacklisting ${notice?.ytId}.`)
        ] }));
}
async function cancelBlacklistingAndExcludeLine(btn, notice) {
    (0, functions_1.removeBlacklisted)(btn.guild, notice.ytId);
    (0, functions_1.excludeLine)(btn.guild, notice.videoId, notice.originalMsgId);
    (0, tryCatch_1.tryOrLog)(() => btn.update({ components: [], embeds: [(0, discord_1.createEmbedMessage)((0, common_tags_1.oneLine) `
    ${notice?.ytId}'s blacklisting has been cancelled but the deleted message
    will not be in the final log.
  `)] }));
}
function clearAuthorTls(btn, notice) {
    const vidLog = (0, functions_1.getGuildRelayHistory)(btn.guild, notice.videoId);
    const cmts = vidLog.filter(cmt => cmt.ytId === notice.ytId);
    const msgs = cmts.map(cmt => cmt.msgId).filter(helpers_1.isNotNil);
    const ch = (0, discord_1.findTextChannel)((0, ramda_1.last)(cmts)?.discordCh ?? '');
    ch?.bulkDelete(msgs)
        .then(deleted => (0, tryCatch_1.tryOrLog)(() => btn.update({ components: [], embeds: [(0, discord_1.createEmbedMessage)(`Deleted ${deleted.size} translations.`)] })))
        .catch(_ => (0, tryCatch_1.tryOrLog)(() => btn.update({ components: [], embeds: [(0, discord_1.createEmbedMessage)('I need Manage Messages permissions.')] })));
}
//# sourceMappingURL=interactionCreate.js.map