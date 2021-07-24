import { Command, createEmbed, createEmbedMessage, reply } from '../../helpers/discord'
import { getSettings, updateSettings } from '../db'
import { EmbedFieldData, Message } from 'discord.js'
import { config } from '../../config'
import { oneLine } from 'common-tags'

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
    msg: Message, [whichList, verb, ...pattern]: string[]
  ): Promise<void> => {
    const str            = pattern.join ('')
    const isListValid    = validLists.includes (whichList as any)
    const isVerbValid    = validVerbs.includes (verb as any)
    const isPatternValid = str.length > 0
    const isValid        = isListValid && isVerbValid && isPatternValid
    const modifyIfValid  = isValid ? modifyList : showHelp
    modifyIfValid (msg, <ValidList> whichList, <ValidVerb> verb, str)
  }
}

///////////////////////////////////////////////////////////////////////////////

const validLists = ['blacklist', 'whitelist'] as const
const validVerbs = ['add', 'remove'] as const
type ValidList   = typeof validLists[number]
type ValidVerb   = typeof validVerbs[number]

async function showHelp (msg: Message): Promise<void> {
  const { customWantedPatterns, customBannedPatterns } = await getSettings (msg)
  reply (msg, createEmbed ({ fields: [{
    name:   'Usage',
    value:  config.prefix + usage,
  },
  ...createListFields (customWantedPatterns, customBannedPatterns)
  ]}))
}

async function modifyList (
  msg: Message, whichList: ValidList, verb: ValidVerb, pattern: string
): Promise<void> {
  const settings = await getSettings (msg)
  const feature  = whichList === 'blacklist' ? 'customBannedPatterns'
                                             : 'customWantedPatterns'
  const current  = settings[feature]
  const isValid  = verb === 'add' ? current.every (s => s !== pattern)
                                  : current.find (s => s === pattern)

  const { customWantedPatterns, customBannedPatterns } = settings

  if (isValid) {
    const newPatterns = verb === 'add' ? [...settings[feature], pattern]
                                       : current.filter (s => s !== pattern)

    updateSettings (msg, { [feature]: newPatterns })

    reply (msg, createEmbed ({ fields: [{
      name:   'Success',
      value:  oneLine`
        ${pattern} was ${verb === 'add' ? 'added to' : 'removed from'}
        the ${whichList}.
      `,
    },   ...createListFields (
      whichList === 'whitelist' ? newPatterns : customWantedPatterns,
      whichList === 'blacklist' ? newPatterns : customBannedPatterns
    )]}))
  } else {
    reply (msg, createEmbed ({ fields: [{
      name:   'Failure',
      value:  oneLine`
        ${pattern} was ${verb === 'add' ? 'already' : 'not found'}
        in the ${whichList}.
      `,
    },
    ...createListFields (customWantedPatterns, customBannedPatterns)
    ]}))
  }
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
