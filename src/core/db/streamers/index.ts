import { hololive } from './hololive'

export const streamers = {
  ...hololive,
}

export {
  hololive
}

export interface Streamer {
  aliases?: Array<string | RegExp>,
  groups?: string[],
  name: string,
  picture: string,
  twitter?: string,
  ytId: string,
}
