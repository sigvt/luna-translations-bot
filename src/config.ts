import { GuildMember, Intents, Message } from 'discord.js'
import { isGuildOwner, isBotOwner, hasKickPerms } from './helpers/discord'
import { isBlacklister, isAdmin } from './core/db'

export const config: LunaBotConfig = {
  deeplKey: process.env.DEEPL_KEY,
  intents:  new Intents (["GUILDS","GUILD_MESSAGES","DIRECT_MESSAGES"]),
  logFile:  'debug2.log',
  ownerId:  '150696503428644864',
  permLevels: [
    { level: 0,  name: 'User',        check: _=> true },
    { level: 1,  name: 'Blacklister', check: isBlacklister },
    { level: 2,  name: 'Admin',       check: isAdmin },
    { level: 3,  name: 'Guild Mod',   check: hasKickPerms },
    { level: 4,  name: 'Guild Owner', check: isGuildOwner },
    { level: 10, name: 'Bot Owner',   check: isBotOwner }
  ],
  prefix: 'tl.',
  token:  process.env.DISCORD_DEV_TOKEN,
}

export interface PermLevel {
  level: number,
  name:  string,
  check: (x: Message | GuildMember) => boolean | Promise<boolean>
}

//// PRIVATE ///////////////////////////////////////////////////////////////////

interface LunaBotConfig {
  deeplKey?:  string,
  intents:    Intents,
  logFile:    string,
  ownerId:    string,
  permLevels: PermLevel[]
  prefix:     string,
  token?:     string,
}
