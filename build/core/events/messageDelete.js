"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageDelete = void 0;
const functions_1 = require("../db/functions");
const discord_1 = require("../../helpers/discord");
const helpers_1 = require("../../helpers");
const common_tags_1 = require("common-tags");
function messageDelete(msg) {
    const [vidId, culprit] = (0, functions_1.findVidIdAndCulpritByMsgId)(msg.guild, msg.id);
    const isNew = msg.guild && !(0, functions_1.isBlacklisted)(culprit?.ytId, msg.guild.id);
    const callback = culprit && isNew ? blacklistAndNotify : helpers_1.doNothing;
    callback(msg, culprit, vidId);
}
exports.messageDelete = messageDelete;
//////////////////////////////////////////////////////////////////////////////
function blacklistAndNotify(msg, culprit, vidId) {
    const reason = 'Deleted by mod.';
    (0, helpers_1.log)((0, common_tags_1.oneLine) `
    A moderator blacklisted ${culprit.ytId} by deleting their TL
    in server ${msg.guild.name} (${msg.guild.id})
  `);
    (0, functions_1.addBlacklisted)(msg.guild, {
        ytId: culprit.ytId, name: culprit.author, reason
    });
    (0, discord_1.send)(msg.channel, {
        embeds: [(0, discord_1.createEmbed)({
                fields: [{
                        name: ':no_entry: Blacklisted channel',
                        value: culprit.ytId,
                        inline: true,
                    }, {
                        name: ':clown: Current name',
                        value: culprit.author,
                        inline: true,
                    }, {
                        name: ':bookmark_tabs: Reason',
                        value: reason,
                        inline: true,
                    }]
            })],
        components: [(0, discord_1.ButtonRow)([
                { label: 'Cancel', customId: 'cancel', style: 2 },
                { label: "Cancel but don't log line", customId: 'cancel2', style: 2 },
                { label: "Clear author's TLs", customId: 'clear', style: 4 },
            ])]
    })
        .then(msg => (0, functions_1.addBlacklistNotice)({
        g: msg?.guild,
        msgId: msg?.id ?? '0',
        ytId: culprit.ytId,
        videoId: vidId,
        originalMsgId: culprit.msgId
    }));
}
//# sourceMappingURL=messageDelete.js.map