/** @file Persistent data not specific to any server */
import { getModelForClass, prop } from '@typegoose/typegoose'

export class BotwideData {
  @prop({ type: () => [String] })
  public notifiedYtLives?: string[]
}

export const BotwideDataDb = getModelForClass (BotwideData)
