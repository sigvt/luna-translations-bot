import { Message } from 'discord.js'
import { createEmbedMessage, reply } from '../../../helpers/discord'
import { SettingToggle } from '../models/GuildSettings'
import { getSettings, updateSettings } from './guildSettings'

export async function toggleSetting (
  props: ToggleProps
): Promise<void> {
  const settings = await getSettings (props.msg)
  const current  = settings[props.setting]
  const notice   = current === true ? props.disable : props.enable

  updateSettings (props.msg, { [props.setting]: !current })
  reply (props.msg, createEmbedMessage (notice))
}

///////////////////////////////////////////////////////////////////////////////

interface ToggleProps {
  msg:     Message
  setting: SettingToggle
  enable:  string
  disable: string
}
