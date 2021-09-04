"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepl = void 0;
const functions_1 = require("../db/functions");
const discord_1 = require("../../helpers/discord");
const common_tags_1 = require("common-tags");
exports.deepl = {
    config: {
        aliases: [],
        permLevel: 2
    },
    help: {
        category: 'Relay',
        usage: 'deepl',
        description: (0, common_tags_1.oneLine) `
      Toggles automatic DeepL translation for Hololive members' chat messages.
      (Also affects tl.holochats)
    `,
    },
    callback: (msg) => {
        (0, functions_1.toggleSetting)({
            msg, setting: 'deepl',
            enable: `
        ${discord_1.emoji.deepl} I will now translate Hololive members' chats with DeepL.
      `,
            disable: `
        ${discord_1.emoji.deepl} I will no longer translate Hololive members' chats
        with DeepL.
      `
        });
    }
};
//# sourceMappingURL=deepl.js.map