"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commands = exports.client = void 0;
const discord_js_1 = require("discord.js");
const discord_1 = require("../helpers/discord");
exports.client = new discord_js_1.Client({ intents: new discord_js_1.Intents(['GUILDS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES']) });
exports.commands = (0, discord_1.loadAllCommands)();
(0, discord_1.loadAllEvents)().forEach((callback, evtName) => exports.client.on(evtName, callback));
//# sourceMappingURL=lunaBotClient.js.map