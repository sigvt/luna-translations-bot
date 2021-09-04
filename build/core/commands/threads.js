"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.threads = void 0;
const functions_1 = require("../db/functions");
const common_tags_1 = require("common-tags");
exports.threads = {
    config: {
        aliases: ['togglethreads', 'thread', 'togglethread'],
        permLevel: 2
    },
    help: {
        category: 'Relay',
        usage: 'threads',
        description: (0, common_tags_1.oneLine) `
      Toggles the posting of translations in threads.
      Requires Public Threads permissions.
    `
    },
    callback: (msg) => {
        (0, functions_1.toggleSetting)({
            msg, setting: 'threads',
            enable: `
        :hash: I will now relay translations in a thread.
        This requires "Public Threads" permissions.
        If given "Manage Messages" permissions, I will pin each thread for 24h.
      `,
            disable: ':hash: I will no longer relay translations in a thread.'
        });
    }
};
//# sourceMappingURL=threads.js.map