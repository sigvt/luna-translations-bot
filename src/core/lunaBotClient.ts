import { Client, Intents } from 'discord.js'
import { loadAllCommands, loadAllEvents } from '../helpers/discord'

export const commands = loadAllCommands ()

export const client = new Client ({ intents: new Intents ([
  'GUILDS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES'
])})

loadAllEvents ().forEach ((callback, evtName) => client.on (evtName, callback))
