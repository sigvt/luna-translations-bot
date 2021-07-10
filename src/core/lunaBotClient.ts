import { Client } from 'discord.js'
import { config } from '../config'
import { loadAllCommands, loadAllEvents } from '../helpers/discord'

export const client   = new Client ({ intents: config.intents })
export const commands = loadAllCommands ()

loadAllEvents ().forEach ((callback, evtName) => client.on (evtName, callback))
