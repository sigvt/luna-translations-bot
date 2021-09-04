"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageCreate = void 0;
const lunaBotClient_1 = require("../lunaBotClient");
const config_1 = require("../../config");
const helpers_1 = require("../../helpers");
const functions_1 = require("../db/functions");
const ramda_1 = require("ramda");
const common_tags_1 = require("common-tags");
const discord_1 = require("../../helpers/discord");
async function messageCreate(msg) {
    const mustSendPrefix = (0, discord_1.mentionsMe)(msg) && !(0, discord_1.isBot)(msg);
    const mustIgnore = lacksBotPrefix(msg)
        || (0, discord_1.isDm)(msg)
        || (0, discord_1.isBot)(msg)
        || isInvalidCommand(msg)
        || await isAuthorTooLowLevel(msg);
    const processMessage = mustSendPrefix ? sendPrefix
        : mustIgnore ? helpers_1.doNothing
            : runRequestedCommand;
    processMessage(msg);
}
exports.messageCreate = messageCreate;
//// PRIVATE //////////////////////////////////////////////////////////////////
function lacksBotPrefix(msg) {
    return !msg.content.startsWith(config_1.config.prefix);
}
function isInvalidCommand(msg) {
    return (0, ramda_1.compose)(ramda_1.isNil, findCommand, ramda_1.head, getCommandWords)(msg);
}
function getCommandWords(msg) {
    return msg.content.slice(config_1.config.prefix.length).trim().split(/ +/g);
}
function findCommand(cmd) {
    return (0, ramda_1.isNil)(cmd)
        ? undefined
        : lunaBotClient_1.commands.get(cmd) || lunaBotClient_1.commands.find(x => x.config.aliases.includes(cmd));
}
async function isAuthorTooLowLevel(msg) {
    await ensureAuthorIsCached(msg);
    const authorLevel = await getAuthorPermLevel(msg);
    const command = (0, ramda_1.compose)(findCommand, ramda_1.head, getCommandWords)(msg);
    return authorLevel < command.config.permLevel;
}
async function ensureAuthorIsCached(msg) {
    msg.member || await msg.guild.members.fetch(msg.author);
}
async function getAuthorPermLevel(msg) {
    const authorPerm = await (0, functions_1.getPermLevel)(msg);
    return authorPerm.level;
}
function sendPrefix(msg) {
    const prefix = config_1.config.prefix;
    (0, discord_1.reply)(msg, (0, discord_1.createEmbed)({
        title: `Hello there! ${discord_1.emoji.respond}`,
        description: `My prefix is \`${prefix}\`. Try running \`${prefix}help\`!`
    }));
}
function runRequestedCommand(msg) {
    const [requestedCmd, ...args] = getCommandWords(msg);
    const command = findCommand(requestedCmd);
    (0, helpers_1.log)((0, common_tags_1.oneLine) `
    ${msg.author.username} (${msg.author.id}) ran ${requestedCmd}
    in server ${msg.guild.name} (${msg.guild.id})
  `);
    command.callback(msg, args);
}
//# sourceMappingURL=messageCreate.js.map