import { Guild } from 'discord.js'
import { log } from '../../helpers'

export function guildDelete (guild: Guild) {
  log (`${guild.name} (${guild.id}) removed the bot.)`)
}

