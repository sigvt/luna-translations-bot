/**
 * @file MongoDB model for guild settings. Using MongoDB over a simple
 * Enmap as settings also need to be accessed from the web dashboard.
 */
import { getModelForClass, prop } from '@typegoose/typegoose'
import { Snowflake } from 'discord.js'

export type StreamerName = string

class WatchFeatureSettings {
  @prop ({ required: true })
  public streamer: StreamerName

  @prop ({ type: () => String, required: true })
  public discordChannel: Snowflake

  @prop ()
  public roleToNotify?: Snowflake
}

class BlacklistItem {
  @prop ({ required: true })
  public ytSnowflake: string

  @prop ({ type: () => String, required: true })
  public discordChannel: Snowflake

  @prop ()
  public reason?: string
}

export class GuildSettings {
  @prop ({ type: () => String })
  public _id: Snowflake

  @prop ({ type: () => [String], default: [] })
  public admins?: Snowflake[]

  @prop ({ type: () => BlacklistItem, default: [] })
  public blacklist?: BlacklistItem[]

  @prop ({ type: () => [String], default: [] })
  public blacklisters?: Snowflake[]

  @prop ({ type: () => WatchFeatureSettings, default: [] })
  public community?: WatchFeatureSettings[]

  @prop ({ type: () => [String], default: [] })
  public customWantedPatterns?: string[]
  
  @prop ({ type: () => [String], default: [] })
  public customBannedPatterns?: string[]

  @prop ({ default: true })
  public deepl?: boolean

  @prop ({ type: () => WatchFeatureSettings, default: [] })
  public mentions?: WatchFeatureSettings[]

  @prop ({ default: true })
  public modMessages?: boolean

  @prop ({ type: () => WatchFeatureSettings, default: [] })
  public relay?: WatchFeatureSettings[]

  @prop ({ type: () => WatchFeatureSettings, default: [] })
  public twitcasting?: WatchFeatureSettings[]

  @prop ({ type: () => WatchFeatureSettings })
  youtube?: WatchFeatureSettings[]
}

export const GuildSettingsDb = getModelForClass (GuildSettings)
