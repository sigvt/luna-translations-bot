import { Message } from 'discord.js'
import { Command, createEmbed, reply } from '../../helpers/discord'
import { streamers } from '../db/streamers'

export const list: Command = {
  config: {
    aliases:   ['streamers', 'idols', 'vtubers', 'channels', 'l'],
    permLevel: 0
  },
  help: {
    category:    'General',
    usage:       'list',
    description: 'Lists supported YT channels and the name to use.',
  },
  callback: (msg: Message): void => {
    const names = streamers.map (streamer => streamer.name)
    reply (msg, createEmbed ({
      title: 'Supported channels',
      description: names.join(', ')
    }))
  }
}
