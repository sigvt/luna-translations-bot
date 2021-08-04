import { Command, createEmbedMessage, reply, validateRole } from '../../helpers/discord'
import { oneLine } from 'common-tags'
import { getSettings, updateSettings } from '../db/functions'
import { Message, Snowflake } from 'discord.js'
import { config } from '../../config'

export const admins: Command = {
  config: {
    aliases:   ['admins', 'admin', 'adminRole', 'a'],
    permLevel: 2
  },
  help: {
    category: 'General',
    usage:    'admins <add|delete> <role mention|ID>',
    description: oneLine`
      Add or delete a role to the bot admin list.
      (People with kick permissions are automatically bot admin.)
    `,
  },
  callback: async (msg: Message, [verb, role]: string[]): Promise<void> => {
    const isVerbValid   = validVerbs.includes (verb as any)
    const validatedRole = validateRole (msg.guild!, role)
    const isValid       = isVerbValid && validatedRole !== undefined
    const modifyIfValid = isValid ? modifyAdminList : showHelp

    modifyIfValid (msg, <ValidVerb> verb, <Snowflake> validatedRole)
  }
}

///////////////////////////////////////////////////////////////////////////////

const validVerbs = ['add', 'delete'] as const
type ValidVerb   = typeof validVerbs[number]

async function showHelp (msg: Message) {
  const settings = await getSettings (msg.guild!)
  reply (msg, createEmbedMessage (`
    **Usage:** \`${config.prefix}${admins.help.usage}\`
    ${getAdminList (settings.admins)}
  `))
}

async function modifyAdminList (
  msg: Message,
  verb: ValidVerb,
  role: Snowflake
): Promise<void> {
  const applyModification = verb === 'add' ? addAdmin : deleteAdmin
  applyModification (msg, role)
}

async function addAdmin (msg: Message, role: Snowflake) {
  const settings = await getSettings (msg)
  if (settings.admins.includes (role)) {
    reply (msg, createEmbedMessage (`
      :warning: <@&${role}> already in the admin list.
      ${getAdminList (settings.admins)}
    `))
  } else {
    const newAdmins = [...settings.admins, role]
    updateSettings (msg, { admins: newAdmins })
    reply (msg, createEmbedMessage (`
      :white_check_mark: <@&${role}> was added to the admin list.
      ${getAdminList (newAdmins)}
    `))
  }
}

async function deleteAdmin (msg: Message, role: Snowflake) {
  const settings = await getSettings (msg)
  if (settings.admins.includes (role)) {
    const newAdmins = settings.admins.filter (id => id !== role)
    updateSettings (msg, { admins: newAdmins })
    reply (msg, createEmbedMessage (`
      :white_check_mark: <@&${role}> was deleted from the admin list.
      ${getAdminList (newAdmins)}
    `))
  } else {
    reply (msg, createEmbedMessage (`
      :warning: <@&${role}> not found in the current blacklister list.
      ${getAdminList (settings.admins)}
    `))
  }
}

function getAdminList (admins: Snowflake[]) {
  return `**Current admins**: ${admins.map (id => '<@&' + id + '>').join (' ')}`
}
