"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.help = void 0;
const lunaBotClient_1 = require("../lunaBotClient");
const functions_1 = require("../db/functions");
const helpers_1 = require("../../helpers");
const ramda_1 = require("ramda");
const discord_1 = require("../../helpers/discord");
const common_tags_1 = require("common-tags");
const config_1 = require("../../config");
exports.help = {
    config: {
        aliases: ['h', 'halp'],
        permLevel: 0
    },
    help: {
        category: 'General',
        usage: 'help <category>',
        description: (0, common_tags_1.oneLine) `
      Displays available commands for your permission level
      in the requested category.
    `
    },
    callback: async (msg, args) => {
        const askedCategory = (0, helpers_1.toTitleCase)((0, ramda_1.head)(args) ?? '');
        const commands = await getCommandsAtUserLevel(msg);
        const categories = getCategoriesOfCommands(commands);
        const helpToShow = categories.includes(askedCategory)
            ? getCategoryHelp(askedCategory)
            : getMainHelp(categories, (0, functions_1.getSettings)(msg));
        (0, discord_1.reply)(msg, helpToShow);
    }
};
///////////////////////////////////////////////////////////////////////////////
async function getCommandsAtUserLevel(msg) {
    const authorLevel = await (0, functions_1.getPermLevel)(msg);
    return lunaBotClient_1.commands.filter(x => x.config.permLevel <= authorLevel.level);
}
function getCategoriesOfCommands(commands) {
    return commands.map(cmd => cmd.help.category)
        .toSet()
        .filter(cat => cat !== 'System');
}
function getCategoryHelp(category) {
    const fields = lunaBotClient_1.commands
        .filter(cmd => cmd.help.category === category)
        .map(cmd => ({
        name: config_1.config.prefix + cmd.help.usage,
        value: cmd.help.description,
        inline: false
    }))
        .toList() // discards keys
        .toArray()
        .sort((fa, fb) => fa.name.localeCompare(fb.name));
    return (0, discord_1.createEmbed)({ fields });
}
function getMainHelp(categories, settings) {
    return (0, discord_1.createEmbed)({
        description: ':candy: I am the Cutest Genius Sexy Beautiful Professor! :candy:',
        fields: [
            ...getCategoryFields(categories),
            getSettingsField(settings),
            getBotManagerField(settings)
        ]
    }, true);
}
function getCategoryFields(categories) {
    return categories.map(category => ({
        name: category,
        value: `${config_1.config.prefix}help ${category.toLowerCase()}`,
        inline: true
    }));
}
function getSettingsField({ relay, gossip, cameos, community, youtube, twitcasting }) {
    return {
        name: 'Current settings', inline: false,
        value: (0, common_tags_1.stripIndents) `
      :speech_balloon: **Translation relay:** ${getWatchList('relay', relay)}
      ${discord_1.emoji.holo} **Live chat cameos:** ${getWatchList('cameos', cameos)}
      ${discord_1.emoji.peek} **Gossip:** ${getWatchList('gossip', gossip)}
      :family_mmbb: **Community posts:** ${getWatchList('community', community)}
      ${discord_1.emoji.yt} **YouTube lives:** ${getWatchList('youtube', youtube)}
      ${discord_1.emoji.tc} **TwitCasting lives:** ${getWatchList('twitcasting', twitcasting)}
    `
    };
}
function getBotManagerField(settings) {
    return {
        name: 'Bot managers', inline: false,
        value: `
      :tools: **Admins:** ${getRoleList('admins', settings)}
      :no_entry: **Blacklisters:** ${getRoleList('blacklisters', settings)}
    `,
    };
}
function getWatchList(feature, entries) {
    const first = (0, ramda_1.head)(entries);
    const firstMention = first?.roleToNotify
        ? `mentioning <@&${first.roleToNotify}>`
        : '';
    const templates = {
        empty: `None. Run \`${config_1.config.prefix}${feature}\``,
        one: `${first?.streamer} in <#${first?.discordCh}> ${firstMention}`,
        many: `Multiple. Run \`${config_1.config.prefix}${feature}\``
    };
    return (0, ramda_1.isEmpty)(entries) ? templates.empty
        : entries.length === 1 ? templates.one
            : templates.many;
}
function getRoleList(type, settings) {
    return settings[type].map(id => `<@&${id}>`).join('')
        || `None yet. run ${config_1.config.prefix}${type}`;
}
//# sourceMappingURL=help.js.map