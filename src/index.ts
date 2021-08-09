/**
 * LUNA'S TRANSLATIONS DISCORD BOT
 */
Error.stackTraceLimit = Infinity
import * as dotenv from 'dotenv'
dotenv.config ({ path: __dirname+'/../.env' })
import { client } from './core/'
import { config } from './config'
import mongoose from 'mongoose'

import { oldSettings } from './oldSettings'
import { NewSettings, updateGuildData, updateBotData, updateSettings } from './core/db/functions'
import { findStreamerName } from './core/db/streamers/'
import { Snowflake } from 'discord.js'

client.login (config.token)
mongoose.connect ('mongodb://localhost/luna', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
})
