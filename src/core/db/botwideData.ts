import { DocumentType } from '@typegoose/typegoose'
import { UpdateQuery } from 'mongoose'
import { BotwideData, BotwideDataDb } from './models'

const _id = '000000000022'

export async function getBotwideData (): Promise<BotwideData> {
  const query = [{ _id }, { _id }, { upsert: true, new: true }] as const
  return BotwideDataDb.findOneAndUpdate (...query)
}

export async function updateBotwideData (update: NewData): Promise<void> {
  const query = [{ _id }, update, { upsert: true, new: true }] as const
  await BotwideDataDb.findOneAndUpdate (...query)
}

type NewData = UpdateQuery<DocumentType<BotwideData>>
