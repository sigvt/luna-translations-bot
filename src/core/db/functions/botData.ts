import { DocumentType } from '@typegoose/typegoose'
import { UpdateQuery } from 'mongoose'
import { setKey } from '../../../helpers'
import { VideoId } from '../../../modules/holodex/frames'
import { BotData, BotDataDb } from '../models'
import { RelayedComment } from '../models/RelayedComment'

const _id = '000000000022'

export async function getBotData (): Promise<BotData> {
  const query = [{ _id }, { _id }, { upsert: true, new: true }] as const
  return BotDataDb.findOneAndUpdate (...query)
}

export async function updateBotData (update: NewData): Promise<void> {
  const query = [{ _id }, update, { upsert: true, new: true }] as const
  await BotDataDb.findOneAndUpdate (...query)
}

export async function addToBotRelayHistory (
  videoId: VideoId, cmt: RelayedComment
): Promise<void> {
  const history    = (await getBotData ()).relayHistory
  const cmts       = history.get (videoId) ?? []
  const newHistory = history |> setKey (videoId, [...cmts, cmt])
  updateBotData ({ relayHistory: newHistory })
}

type NewData = UpdateQuery<DocumentType<BotData>>
