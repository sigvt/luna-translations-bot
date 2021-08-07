/**
 * @file Per-guild persistent data (not settings)
 */
import { getModelForClass, prop } from '@typegoose/typegoose'
import { WhatIsIt } from '@typegoose/typegoose/lib/internal/constants'
import { Snowflake } from 'discord.js'
import { VideoId, YouTubeChannelId } from '../../../modules/holodex/frames'
import { RelayedComment } from './RelayedComment'

export class GuildData {
  @prop ({ type: () => String })
  public _id: Snowflake

  @prop({ type: () => [RelayedComment], default: () => new Map () }, WhatIsIt.MAP)
  relayHistory: Map<VideoId, RelayedComment[]>

  @prop ({ type: () => Notice, default: () => new Map () }, WhatIsIt.MAP)
  blacklistNotices: Map<MessageId, Notice>
}

export class Notice {
  @prop ({ type: () => String })
  ytId: YouTubeChannelId

  @prop ({ type: () => String })
  videoId: VideoId
  
  @prop ({ type: () => String })
  originalMsgId: Snowflake
}

export const GuildDataDb = getModelForClass (GuildData)

type MessageId = Snowflake
