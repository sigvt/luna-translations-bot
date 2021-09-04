"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const util_1 = require("util");
const config_1 = require("../../config");
const lunaBotClient_1 = require("../lunaBotClient"); // for eval scope
const functions_1 = require("../db/functions");
const tryCatch_1 = require("../../helpers/tryCatch");
const sendMessages_1 = require("../../helpers/discord/sendMessages");
exports.run = {
    config: {
        aliases: ['eval'],
        permLevel: 10
    },
    help: {
        category: 'System',
        usage: 'run <code>',
        description: 'Evaluates arbitrary JS.',
    },
    callback: async (msg, args) => {
        const output = await processCode(msg, args);
        (0, sendMessages_1.reply)(msg, undefined, '```js\n' + output + '\n```');
    }
};
///////////////////////////////////////////////////////////////////////////////
async function processCode(msg, code) {
    // keep imports in eval scope via _
    const _ = { client: lunaBotClient_1.client, getSettings: functions_1.getSettings, updateSettings: functions_1.updateSettings, getGuildData: functions_1.getGuildData, updateGuildData: functions_1.updateGuildData };
    const evaled = await (0, tryCatch_1.tryOrDefault)(() => eval(code.join(' ')), '');
    const string = toString(evaled);
    const cleaned = string
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203))
        .replaceAll(config_1.config.token ?? '[censored]', '[censored]')
        .replaceAll(config_1.config.deeplKey ?? '[censored]', '[censored]');
    return cleaned;
}
function toString(x) {
    return typeof x === 'string' ? x : (0, util_1.inspect)(x, { depth: 1 });
}
//# sourceMappingURL=run.js.map