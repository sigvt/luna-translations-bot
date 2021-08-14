/**
 * LUNA'S TRANSLATIONS DISCORD BOT
 */
Error.stackTraceLimit = Infinity
import * as dotenv from 'dotenv'
dotenv.config ({ path: __dirname+'/../.env' })
import { client } from './core/'
import { config } from './config'
import mongoose from 'mongoose'

client.login (config.token)
// mongoose.set('debug', true)
mongoose.set("debug", (collectionName: any, method: any, query: any, doc: any) => {
    console.log(`${collectionName}.${method}`, JSON.stringify(query))
});
mongoose.connect ('mongodb://localhost/luna', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
})
