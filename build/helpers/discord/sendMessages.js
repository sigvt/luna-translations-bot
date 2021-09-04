"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonRow = exports.react = exports.createTxtEmbed = exports.createEmbed = exports.createEmbedMessage = exports.send = exports.reply = void 0;
const ts_deepmerge_1 = __importDefault(require("ts-deepmerge"));
const core_1 = require("../../core/");
const discord_js_1 = require("discord.js");
const logging_1 = require("../logging");
const general_1 = require("./general");
const { isArray } = Array;
async function reply(msg, embed, text, file) {
    return (0, general_1.canBot)('SEND_MESSAGES', msg.channel)
        ? msg.reply({
            ...(embed ? { embeds: isArray(embed) ? embed : [embed] } : {}),
            ...(text ? { content: text } : {}),
            ...(file ? { files: [file] } : {}),
            failIfNotExists: false
        }).catch(logging_1.warn)
        : undefined;
}
exports.reply = reply;
async function send(channel, content) {
    return (0, general_1.canBot)('SEND_MESSAGES', channel)
        ? channel.send(content).catch(e => (0, logging_1.warn)(`${channel.id} ${e}`))
        : undefined;
}
exports.send = send;
function createEmbedMessage(body, fancy = false) {
    return createEmbed({
        author: fancy ? getEmbedSelfAuthor() : undefined,
        thumbnail: fancy ? getEmbedSelfThumbnail() : undefined,
        description: body
    });
}
exports.createEmbedMessage = createEmbedMessage;
function createEmbed(options, fancy = false) {
    const base = {
        author: fancy ? getEmbedSelfAuthor() : undefined,
        color: '#8e4497',
        thumbnail: fancy ? getEmbedSelfThumbnail() : undefined
    };
    return new discord_js_1.MessageEmbed((0, ts_deepmerge_1.default)(base, options));
}
exports.createEmbed = createEmbed;
function createTxtEmbed(title, content) {
    return new discord_js_1.MessageAttachment(Buffer.from(content, 'utf-8'), title);
}
exports.createTxtEmbed = createTxtEmbed;
async function react(msg, emj) {
    if ((0, general_1.canBot)('ADD_REACTIONS', msg?.channel)) {
        return msg?.react(emj);
    }
}
exports.react = react;
function ButtonRow(buttons) {
    return new discord_js_1.MessageActionRow({
        components: buttons.map(opts => new discord_js_1.MessageButton(opts))
    });
}
exports.ButtonRow = ButtonRow;
//// PRIVATE //////////////////////////////////////////////////////////////////
function getEmbedSelfAuthor() {
    return {
        name: core_1.client.user.username,
        iconURL: core_1.client.user.displayAvatarURL(),
    };
}
function getEmbedSelfThumbnail() {
    return { url: core_1.client.user.displayAvatarURL() };
}
//# sourceMappingURL=sendMessages.js.map