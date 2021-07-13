import { Message } from 'discord.js'
import { Command, createEmbed, reply } from '../../helpers/discord'
import { getStreamerList } from '../db/streamers/'

export const list: Command = {
  config: {
    aliases:   ['streamers', 'idols', 'vtubers', 'channels', 'l'],
    permLevel: 0
  },
  help: {
    category:    'General',
    usage:       'list',
    description: 'Lists supported YT channels.',
  },
  callback: (msg: Message): void => {
    reply (msg, createEmbed ({
      title: 'Supported channels',
      description: getStreamerList ()
    }))
  }
}
