"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const discord_js_1 = require("discord.js");
const functions_1 = require("./core/db/functions");
const discord_1 = require("./helpers/discord");
exports.config = {
    deeplKey: process.env.DEEPL_KEY,
    intents: new discord_js_1.Intents(['GUILDS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES']),
    logFile: 'debug3.log',
    ownerId: '150696503428644864',
    permLevels: [
        { level: 0, name: 'User', check: () => true },
        { level: 1, name: 'Blacklister', check: functions_1.isBlacklister },
        { level: 2, name: 'Admin', check: functions_1.isAdmin },
        { level: 3, name: 'Guild Mod', check: discord_1.hasKickPerms },
        { level: 4, name: 'Guild Owner', check: discord_1.isGuildOwner },
        { level: 10, name: 'Bot Owner', check: discord_1.isBotOwner }
    ],
    prefix: 'tl.',
    token: process.env.DISCORD_DEV_TOKEN,
    twitcastingId: process.env.TWITCASTING_CLIENT_ID,
    twitcastingSecret: process.env.TWITCASTING_CLIENT_SECRET,
    holodexKey: process.env.HOLODEX_API_KEY,
};
//# sourceMappingURL=config.js.map