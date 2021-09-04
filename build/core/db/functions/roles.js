"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInputAndModifyRoleList = void 0;
const discord_1 = require("../../../helpers/discord");
const _1 = require("./");
const config_1 = require("../../../config");
const helpers_1 = require("../../../helpers");
function validateInputAndModifyRoleList(opts) {
    const isVerbValid = validVerbs.includes(opts.verb);
    const validatedRole = (0, discord_1.validateRole)(opts.msg.guild, opts.role);
    const isValid = isVerbValid && validatedRole !== undefined;
    const modifyIfValid = isValid ? modifyRoleList : showHelp;
    const g = (0, _1.getSettings)(opts.msg);
    modifyIfValid({ ...opts, role: validatedRole, g });
}
exports.validateInputAndModifyRoleList = validateInputAndModifyRoleList;
///////////////////////////////////////////////////////////////////////////////
const validVerbs = ['add', 'remove'];
function showHelp(opts) {
    (0, discord_1.reply)(opts.msg, (0, discord_1.createEmbedMessage)(`
    **Usage:** \`${config_1.config.prefix}${opts.type} <add|remove> <role ID|mention>\`
    ${getRoleList(opts.g[opts.type])}
  `));
}
function modifyRoleList(opts) {
    const isNew = !opts.g[opts.type].includes(opts.role);
    const modify = (0, helpers_1.match)(opts.verb, {
        add: isNew ? addRole : notifyNotNew,
        remove: !isNew ? removeRole : notifyNotFound
    });
    modify(opts);
}
function addRole(opts) {
    const newRoles = [...opts.g[opts.type], opts.role];
    (0, _1.updateSettings)(opts.msg, { [opts.type]: newRoles });
    (0, discord_1.reply)(opts.msg, (0, discord_1.createEmbedMessage)(`
    :white_check_mark: <@&${opts.role}> was added to the ${opts.type} list.
    ${getRoleList(newRoles)}
  `));
}
async function removeRole(opts) {
    const newRoles = opts.g[opts.type].filter(id => id !== opts.role);
    (0, _1.updateSettings)(opts.msg, { [opts.type]: newRoles });
    (0, discord_1.reply)(opts.msg, (0, discord_1.createEmbedMessage)(`
    :white_check_mark: <@&${opts.role}> was removed from the ${opts.type} list.
    ${getRoleList(newRoles)}
  `));
}
function notifyNotNew(opts) {
    (0, discord_1.reply)(opts.msg, (0, discord_1.createEmbedMessage)(`
    :warning: <@&${opts.role}> already in the ${opts.type} list.
    ${getRoleList(opts.g[opts.type])}
  `));
}
function notifyNotFound(opts) {
    (0, discord_1.reply)(opts.msg, (0, discord_1.createEmbedMessage)(`
    :warning: <@&${opts.role}> not found in the current ${opts.type} list.
    ${getRoleList(opts.g[opts.type])}
  `));
}
function getRoleList(roles) {
    return `**Current**: ${roles.map(id => '<@&' + id + '>').join(' ')}`;
}
//# sourceMappingURL=roles.js.map