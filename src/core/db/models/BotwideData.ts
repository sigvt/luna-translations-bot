/** @file Persistent data not specific to any server */
import { getModelForClass, prop } from '@typegoose/typegoose'
import { WhatIsIt } from '@typegoose/typegoose/lib/internal/constants'

export class BotwideData {
  @prop({ type: () => [String], default: [] })
  public notifiedYtLives: YouTubeVideoId[]

  @prop({ type: String, default: () => new Map () }, WhatIsIt.MAP)
  lastCommunityPosts: Map<YouTubeChannelId, CommunityPostURL>
}

export const BotwideDataDb = getModelForClass (BotwideData)

type YouTubeChannelId   = string
type CommunityPostURL   = string
type YouTubeVideoId     = string
