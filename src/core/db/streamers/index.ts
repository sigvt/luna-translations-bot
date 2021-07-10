export * from './hololive'

export interface Streamer {
  aliases?: Array<string | RegExp>,
  groups?: string[],
  name: string,
  picture: string,
  twitter?: string,
  ytId: string,
}
