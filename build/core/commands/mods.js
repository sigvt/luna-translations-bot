"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mods = void 0;
const functions_1 = require("../db/functions");
exports.mods = {
    config: {
        aliases: ['togglemods'],
        permLevel: 2
    },
    help: {
        category: 'Relay',
        usage: 'mods',
        description: 'Toggles the relaying of mod messages serverwide.'
    },
    callback: (msg) => {
        (0, functions_1.toggleSetting)({
            msg, setting: 'modMessages',
            enable: `:tools: I will now relay mod messages.`,
            disable: `
        :tools: I will no longer relay mod messages.
        (Channel owner and other Hololive members will still be relayed.)
      `
        });
    }
};
//# sourceMappingURL=mods.js.map