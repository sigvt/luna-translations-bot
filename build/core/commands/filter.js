"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filter = void 0;
const discord_1 = require("../../helpers/discord");
const functions_1 = require("../db/functions");
const config_1 = require("../../config");
const common_tags_1 = require("common-tags");
const ramda_1 = require("ramda");
const usage = 'filter <blacklist|whitelist> <add|remove> <pattern>';
exports.filter = {
    config: {
        aliases: [],
        permLevel: 1
    },
    help: {
        category: 'Relay',
        usage,
        description: 'Manage custom-banned strings and custom-desired strings.',
    },
    callback: (msg, [type, verb, ...pattern]) => {
        const str = pattern.join('');
        const g = (0, functions_1.getSettings)(msg);
        const feature = type === 'blacklist' ? 'customBannedPatterns'
            : 'customWantedPatterns';
        const current = g[feature];
        const isListValid = validLists.includes(type);
        const isVerbValid = validVerbs.includes(verb);
        const mustShowHelp = !isListValid || !isVerbValid || (0, ramda_1.isEmpty)(pattern);
        const isPatternValid = verb === 'add' ? current.every(s => s !== str)
            : current.find(s => s === str);
        const modifyIfValid = mustShowHelp ? showHelp
            : isPatternValid ? modifyList
                : notifyInvalidPattern;
        modifyIfValid({
            msg, type: type, verb: verb, pattern: str, g
        });
    }
};
///////////////////////////////////////////////////////////////////////////////
const validLists = ['blacklist', 'whitelist'];
const validVerbs = ['add', 'remove'];
function showHelp({ msg, g }) {
    (0, discord_1.reply)(msg, (0, discord_1.createEmbed)({ fields: [{
                name: 'Usage',
                value: config_1.config.prefix + usage,
            },
            ...createListFields(g.customWantedPatterns, g.customBannedPatterns)] }));
}
async function modifyList(opts) {
    const feature = opts.type === 'blacklist' ? 'customBannedPatterns'
        : 'customWantedPatterns';
    const current = opts.g[feature];
    const edited = opts.verb === 'add' ? [...current, opts.pattern]
        : current.filter(s => s !== opts.pattern);
    (0, functions_1.updateSettings)(opts.msg, { [feature]: edited });
    (0, discord_1.reply)(opts.msg, (0, discord_1.createEmbed)({ fields: [{
                name: 'Success',
                value: (0, common_tags_1.oneLine) `
      ${opts.pattern} was ${opts.verb === 'add' ? 'added to' : 'removed from'}
      the ${opts.type}.
    `,
            }, ...createListFields(opts.type === 'whitelist' ? edited : opts.g.customWantedPatterns, opts.type === 'blacklist' ? edited : opts.g.customBannedPatterns)] }));
}
function notifyInvalidPattern(opts) {
    (0, discord_1.reply)(opts.msg, (0, discord_1.createEmbed)({ fields: [{
                name: 'Failure',
                value: (0, common_tags_1.oneLine) `
      ${opts.pattern} was ${opts.verb === 'add' ? 'already' : 'not found'}
      in the ${opts.type}.
    `,
            },
            ...createListFields(opts.g.customWantedPatterns, opts.g.customBannedPatterns)] }));
}
function createListFields(whitelist, blacklist) {
    return [{
            name: 'Current whitelist',
            value: whitelist.join(', ') || '*Nothing yet*',
            inline: false,
        }, {
            name: 'Current blacklist',
            value: blacklist.join(', ') || '*Nothing yet*',
            inline: false,
        }];
}
//# sourceMappingURL=filter.js.map