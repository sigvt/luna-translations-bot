import { getAllSettings } from '../core/db'
import { GuildSettings } from '../core/db/models'
import { Streamer, StreamerName, streamers } from '../core/db/streamers'
import { emoji, notifyDiscord } from '../helpers/discord'
import { frameEmitter } from './holodex/frameEmitter'
import { DexFrame } from './holodex/frames'

frameEmitter.on ('frame', notifyFrame)

async function notifyFrame (frame: DexFrame): Promise<void> {
  const settings     = await getAllSettings ()
  const streamer     = streamers.find (s => s.ytId === frame.channel.id)
  
  if (frame.status === 'live') notifyDiscord ({
    subbedGuilds: settings.filter (g => isRelaying (g, streamer?.name)),
    feature: 'youtube',
    streamer: streamer as Streamer,
    embedBody: `I am live on YouTube!\nhttps://youtu.be/${frame.id}`,
    emoji: emoji.yt
  })
}

function isRelaying (guild: GuildSettings, streamer?: StreamerName): boolean {
  return guild.youtube.some (entry => streamer === entry.streamer)
}
