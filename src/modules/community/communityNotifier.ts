import { oneLine } from 'common-tags'
import { TextChannel } from 'discord.js'
import { client } from '../../core'
import { getAllSettings } from '../../core/db/functions'
import { GuildSettings } from '../../core/db/models'
import { StreamerName, streamers } from '../../core/db/streamers'
import { createEmbed, send } from '../../helpers/discord'
import { communityEmitter } from './communityEmitter'
import { CommunityPost } from './getLatestPost'

communityEmitter.on ('post', notifyPost)

async function notifyPost (post: CommunityPost): Promise<void> {
  const allSettings = await getAllSettings ()
  const streamer  = streamers.find (s => s.ytId == post.ytId)
  const guilds    = allSettings.filter (g => follows (streamer!.name, g))

  guilds.forEach (g => {
    const subs = g.community.filter (e => e.streamer === streamer!.name)
    subs.forEach (({ streamer, discordCh, roleToNotify }) => {
      const guild = client.guilds.cache.find (gg => gg.id === g._id)
      const ch    = <TextChannel> guild?.channels.cache
                      .find (ch => ch.id == discordCh)
      send (ch, {
        content: oneLine`
          :loudspeaker: ${roleToNotify ? '<@&' + roleToNotify + '>' : ''}
          ${streamer} just published a community post!\n
          ${post.url}
        `,
        embeds: [createEmbed ({
          url: post.url,
          author: { name: post.author, iconURL: post.avatar, url: post.url },
          description: post.content,
          thumbnail: { url: post.avatar }
        })]
      })
    })
  })
}

function follows (
  streamer: StreamerName, settings: GuildSettings
): boolean {
  return settings.community.map (el => el.streamer).includes (streamer)
}
