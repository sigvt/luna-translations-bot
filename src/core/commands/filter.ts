import { Command, createEmbed, reply } from '../../helpers/discord'
import { getSettings, updateSettings } from '../db/functions'
import { EmbedFieldData, Message } from 'discord.js'
import { config } from '../../config'
import { oneLine } from 'common-tags'
import { isEmpty } from 'ramda'
import { GuildSettings } from '../db/models'

const usage = 'filter <blacklist|whitelist> <add|remove> <pattern>'

export const filter: Command = {
  config: {
    aliases:   [],
    permLevel: 1
  },
  help: {
    category: 'Relay',
    usage,
    description: 'Manage custom-banned strings and custom-desired strings.',
  },
  callback: async (
    msg: Message, [type, verb, ...pattern]: string[]
  ): Promise<void> => {
    const str            = pattern.join ('')
    const g              = await getSettings (msg)
    const feature        = type === 'blacklist' ? 'customBannedPatterns'
                                                : 'customWantedPatterns'
    const current        = g[feature]
    const isListValid    = validLists.includes (type as any)
    const isVerbValid    = validVerbs.includes (verb as any)
    const mustShowHelp   = !isListValid || !isVerbValid || isEmpty (pattern)
    const isPatternValid = verb === 'add' ? current.every (s => s !== str)
                                          : current.find (s => s === str)
    const modifyIfValid  = mustShowHelp   ? showHelp
                         : isPatternValid ? modifyList
                                          : notifyInvalidPattern

    modifyIfValid ({
      msg, type: type as ValidList, verb: verb as ValidVerb, pattern: str, g
    })
  }
}

///////////////////////////////////////////////////////////////////////////////

const validLists = ['blacklist', 'whitelist'] as const
const validVerbs = ['add', 'remove'] as const
type ValidList   = typeof validLists[number]
type ValidVerb   = typeof validVerbs[number]

interface ModifyPatternListOptions {
  msg:     Message
  type:    ValidList
  verb:    ValidVerb
  pattern: string
  g:       GuildSettings
}

async function showHelp ({ msg, g }: ModifyPatternListOptions): Promise<void> {
  reply (msg, createEmbed ({ fields: [{
    name:   'Usage',
    value:  config.prefix + usage,
  },
  ...createListFields (g.customWantedPatterns, g.customBannedPatterns)
  ]}))
}

async function modifyList (opts: ModifyPatternListOptions): Promise<void> {
  const feature = opts.type === 'blacklist' ? 'customBannedPatterns'
                                            : 'customWantedPatterns'
  const current = opts.g[feature]
  const edited  = opts.verb === 'add' ? [...current, opts.pattern]
                                      : current.filter (s => s !== opts.pattern)

  updateSettings (opts.msg, { [feature]: edited })

  reply (opts.msg, createEmbed ({ fields: [{
    name:   'Success',
    value:  oneLine`
      ${opts.pattern} was ${opts.verb === 'add' ? 'added to' : 'removed from'}
      the ${opts.type}.
    `,
  },   ...createListFields (
    opts.type === 'whitelist' ? edited : opts.g.customWantedPatterns,
    opts.type === 'blacklist' ? edited : opts.g.customBannedPatterns
  )]}))
}

function notifyInvalidPattern (opts: ModifyPatternListOptions): void {
  reply (opts.msg, createEmbed ({ fields: [{
    name:   'Failure',
    value:  oneLine`
      ${opts.pattern} was ${opts.verb === 'add' ? 'already' : 'not found'}
      in the ${opts.type}.
    `,
  },
  ...createListFields (opts.g.customWantedPatterns, opts.g.customBannedPatterns)
  ]}))
}


function createListFields (
  whitelist: string[], blacklist: string[]
): EmbedFieldData[] {
  return [{
    name: 'Current whitelist',
    value: whitelist.join (', ') || '*Nothing yet*',
    inline: false,
  }, {
    name: 'Current blacklist',
    value: blacklist.join (', ') || '*Nothing yet*',
    inline: false,
  }]
}
