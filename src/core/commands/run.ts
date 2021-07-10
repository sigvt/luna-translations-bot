import { Command } from '../discordHelpers'
import { Message } from 'discord.js'
import { inspect } from 'util'
import { config } from '../../config'

export const run: Command = {
  config: {
    aliases:   [],
    permLevel: 10
  },
  help: {
    category:    'System',
    usage:       'run <code>',
    description: 'Evaluates arbitrary JS.',
  },
  callback: async (msg: Message, args: string[]): Promise<void> => {
    const output = await processCode (args)
    msg.reply('```' + output + '```')
  }
}

///////////////////////////////////////////////////////////////////////////////

async function processCode (code: string[]): Promise<string> {
    const evaled  = code.join (' ') |> eval
    const awaited = await evaled
    const string  = toString (awaited)
    const cleaned = string
      .replace (/`/g, "`" + String.fromCharCode (8203))
      .replace (/@/g, "@" + String.fromCharCode (8203))
      .replace (config.token ?? '[censored]', '[censored]')
      .replace (config.deeplKey ?? '[censored]', '[censored]')
    return cleaned
}

function toString (x: any): string {
  return typeof x === 'string' ? x : inspect (x, { depth: 1 })
}
