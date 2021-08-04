import { Command, createEmbedMessage, reply, validateRole } from '../../helpers/discord'
import { oneLine } from 'common-tags'
import { getSettings, updateSettings } from '../db/functions'
import { Message, Snowflake } from 'discord.js'
import { config } from '../../config'

export const blacklisters: Command = {
  config: {
    aliases:   [],
    permLevel: 2
  },
  help: {
    category: 'General',
    usage:    'blacklisters <add|delete> <role mention|ID>',
    description: oneLine`
      Add or delete a role to the bot blacklister list.
      (Admins and people with kick permissions are automatically blacklisters.)
    `,
  },
  callback: async (msg: Message, args: string[]): Promise<void> => {
    const [verb, role]  = args
    const isVerbValid   = validVerbs.includes (verb as any)
    const validatedRole = validateRole (msg.guild!, role)
    const isValid       = isVerbValid && validatedRole !== undefined
    const modifyIfValid = isValid ? modifyBlacklisterList : showHelp

    modifyIfValid (msg, <ValidVerb> verb, <Snowflake> validatedRole)
  }
}

///////////////////////////////////////////////////////////////////////////////

const validVerbs = ['add', 'delete'] as const
type ValidVerb   = typeof validVerbs[number]

async function showHelp (msg: Message) {
  const settings = await getSettings (msg.guild!)
  reply (msg, createEmbedMessage (`
    **Usage:** \`${config.prefix}${blacklisters.help.usage}\`
    ${getBlacklisterList (settings.blacklisters)}
  `))
}

async function modifyBlacklisterList (
  msg: Message,
  verb: ValidVerb,
  role: Snowflake
): Promise<void> {
  const applyModification = verb === 'add' ? addBlacklister : deleteBlacklister
  applyModification (msg, role)
}

async function addBlacklister (msg: Message, role: Snowflake) {
  const settings = await getSettings (msg)
  if (settings.blacklisters.includes (role)) {
    reply (msg, createEmbedMessage (`
      :warning: <@&${role}> already in the blacklister list.
      ${getBlacklisterList (settings.blacklisters)}
    `))
  } else {
    const newBlacklisters = [...settings.blacklisters, role]
    updateSettings (msg, { blacklisters: newBlacklisters })
    reply (msg, createEmbedMessage (`
      :white_check_mark: <@&${role}> was added to the blacklister list.
      ${getBlacklisterList (newBlacklisters)}
    `))
  }
}

async function deleteBlacklister (msg: Message, role: Snowflake) {
  const settings = await getSettings (msg)
  if (settings.blacklisters.includes (role)) {
    const newBlacklisters = settings.blacklisters.filter (id => id !== role)
    updateSettings (msg, { blacklisters: newBlacklisters })
    reply (msg, createEmbedMessage (`
      :white_check_mark: <@&${role}> was deleted from the blacklister list.
      ${getBlacklisterList (newBlacklisters)}
    `))
  } else {
    reply (msg, createEmbedMessage (`
      :warning: <@&${role}> not found in the current blacklister list.
      ${getBlacklisterList (settings.blacklisters)}
    `))
  }
}

function getBlacklisterList (blacklisters: Snowflake[]) {
  const list = blacklisters.map (id => '<@&' + id + '>').join (' ')
  return `**Current blacklisters**: ${list}`
}
