/**
 * @file Per-guild persistent data (not settings)
 */
import { getModelForClass, prop } from '@typegoose/typegoose'
import { WhatIsIt } from '@typegoose/typegoose/lib/internal/constants'
import { VideoId } from '../../../modules/holodex/frames'
import { RelayedComment } from './RelayedComment'

export class GuildData {
  @prop({ type: () => RelayedComment, default: () => new Map () }, WhatIsIt.MAP)
  relayHistory: Map<VideoId, RelayedComment[]>
}

export const GuildDataDb = getModelForClass (GuildData)
