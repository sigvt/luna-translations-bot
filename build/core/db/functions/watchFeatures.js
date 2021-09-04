"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubbedGuilds = exports.validateInputAndModifyEntryList = void 0;
/**
 * @file This file manages addition and removals from WatchFeatureSettings
 * via Discord command.
 **/
const discord_1 = require("../../../helpers/discord");
const language_1 = require("../../../helpers/language");
const _1 = require("./");
const config_1 = require("../../../config");
const streamers_1 = require("../../db/streamers/");
const guildSettings_1 = require("./guildSettings");
const ramda_1 = require("ramda");
const { isArray } = Array;
function validateInputAndModifyEntryList({ msg, verb, streamer, role, usage, feature, add, remove }) {
    const isVerbValid = validVerbs.includes(verb);
    const validatedVerb = verb;
    const validatedStreamer = (0, streamers_1.findStreamerName)(streamer);
    const mustShowList = verb !== 'clear' && !validatedStreamer;
    const g = (0, _1.getSettings)(msg.guild);
    const modifyIfValid = !isVerbValid ? showHelp
        : mustShowList ? streamers_1.replyStreamerList
            : modifyEntryList;
    modifyIfValid({ g, msg, usage, feature, role, add, remove,
        verb: validatedVerb,
        streamer: validatedStreamer,
    });
}
exports.validateInputAndModifyEntryList = validateInputAndModifyEntryList;
function getSubbedGuilds(nameOrChannelId, features) {
    const guilds = (0, guildSettings_1.getAllSettings)();
    const streamer = streamers_1.streamers.find(s => s.ytId === nameOrChannelId)?.name
        ?? streamers_1.streamers.find(s => s.name === nameOrChannelId)?.name;
    const feats = isArray(features) ? features : [features];
    return guilds.filter(g => getSubs(g, feats).some(sub => [streamer, 'all'].includes(sub)));
}
exports.getSubbedGuilds = getSubbedGuilds;
///////////////////////////////////////////////////////////////////////////////
const validVerbs = ['add', 'remove', 'clear'];
function showHelp({ msg, feature, usage }) {
    const settings = (0, _1.getSettings)(msg.guild);
    const list = getEntryList(settings[feature], 60);
    const embeds = ((0, ramda_1.isEmpty)(list) ? [''] : list)
        .map((list, i) => (0, discord_1.createEmbedMessage)(i > 0 ? '.' : `**Usage:** \`${config_1.config.prefix}${usage}\n\n\``
        + `**Currently relayed:**\n${list}`));
    (0, discord_1.reply)(msg, embeds);
}
function modifyEntryList(opts) {
    const g = (0, _1.getSettings)(opts.msg);
    const isNew = g[opts.feature].every(r => r.discordCh != opts.msg.channel.id || r.streamer != opts.streamer);
    const applyModification = (0, language_1.match)(opts.verb, {
        add: isNew ? addEntry : notifyNotNew,
        remove: !isNew ? removeEntry : notifyNotFound,
        clear: clearEntries
    });
    applyModification(opts);
}
function addEntry({ g, feature, msg, streamer, role, add }) {
    const newEntries = [...g[feature], {
            streamer,
            discordCh: msg.channel.id,
            ...(role ? { roleToNotify: role } : {})
        }];
    (0, _1.updateSettings)(msg, { [feature]: newEntries });
    (0, discord_1.reply)(msg, (0, discord_1.createEmbed)({ fields: [{
                name: add.success,
                value: streamer,
                inline: true
            }, {
                name: `${discord_1.emoji.discord} In channel`,
                value: `<#${msg.channel.id}>`,
                inline: true
            }, ...(role ? [{
                    name: `${discord_1.emoji.ping} @mentioning`,
                    value: `<@&${role}>`,
                    inline: true
                }] : []),
            ...getEntryFields(newEntries)] }, false));
}
function removeEntry({ feature, msg, streamer, remove, g }) {
    const newEntries = g[feature]
        .filter(r => r.discordCh !== msg.channel.id || r.streamer !== streamer);
    (0, _1.updateSettings)(msg, { [feature]: newEntries });
    (0, discord_1.reply)(msg, (0, discord_1.createEmbed)({ fields: [
            {
                name: remove.success,
                value: streamer,
                inline: true
            },
            {
                name: `${discord_1.emoji.discord} In channel`,
                value: `<#${msg.channel.id}>`,
                inline: true
            },
            ...getEntryFields(newEntries)
        ] }, false));
}
function notifyNotNew({ msg, add, g, feature }) {
    (0, discord_1.reply)(msg, (0, discord_1.createEmbed)({
        description: add.failure, fields: getEntryFields(g[feature])
    }, false));
}
function notifyNotFound({ msg, remove, g, feature }) {
    (0, discord_1.reply)(msg, (0, discord_1.createEmbed)({ fields: [
            {
                name: 'Error',
                value: remove.failure,
                inline: false
            },
            ...getEntryFields(g[feature])
        ] }, false));
}
async function clearEntries({ feature, msg }) {
    (0, _1.updateSettings)(msg, { [feature]: [] });
    (0, discord_1.reply)(msg, (0, discord_1.createEmbedMessage)(`Cleared all entries for ${feature}.`));
}
function getEntryFields(entries) {
    return getEntryList(entries)
        .map(list => ({
        name: 'Currently relayed',
        value: list || 'No one',
        inline: false
    }));
}
/** Returns an array of embed-sized strings */
function getEntryList(entries, linesPerChunk = 20) {
    const lines = entries.map(x => x.roleToNotify
        ? `${x.streamer} in <#${x.discordCh}> @mentioning <@&${x.roleToNotify}>`
        : `${x.streamer} in <#${x.discordCh}>`);
    const chunks = (0, ramda_1.splitEvery)(linesPerChunk)(lines);
    return chunks.map(chunk => chunk.join('\n'));
}
function getSubs(g, fs) {
    return fs.flatMap(f => g[f].map(entry => entry.streamer));
}
//# sourceMappingURL=watchFeatures.js.map