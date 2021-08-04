/**
 * @file Per-guild persistent data (not settings)
 */
import { getModelForClass, prop } from '@typegoose/typegoose'
import { WhatIsIt } from '@typegoose/typegoose/lib/internal/constants'
import { Snowflake } from 'discord.js'
import { VideoId } from '../../../modules/holodex/frames'
import { RelayedComment } from './RelayedComment'

export class GuildData {
  @prop ({ type: () => String })
  public _id: Snowflake

  @prop({ type: () => RelayedComment, default: () => new Map () }, WhatIsIt.MAP)
  relayHistory: RelayHistory
}

export type RelayHistory = Map<VideoId, RelayedComment[]>

export const GuildDataDb = getModelForClass (GuildData)
