module.exports = (client, message) => {
  if (message.author.id !== client.user.id) return
  const guildLog = client.tlLog.get(message.guild.id) ?? {}
  const culprit = Object.values(guildLog).flat().find(el => el.msgId == message.id)
  if (!culprit) return
  const guildSettings = client.settings.get(message.guild.id) ?? {}
  const previousBlacklist = guildSettings.blacklist ?? []

  const reason = 'Deleted by mod.'

  if (previousBlacklist.find(x => x.channel === culprit.channel)) return

  client.settings.set(message.guild.id, [...previousBlacklist, {
    channel: culprit.channel,
    name: culprit.name,
    reason: reason
  }], 'blacklist')

    const embed = client.makeEmbed({
      'fields': [
        {
          'name':  ':no_entry: Blacklisted channel',
          'value': culprit.channel,
          'inline': true,
        },
        {
          'name':  ':clown: Current name',
          'value': culprit.name,
          'inline': true,
        },
        {
          'name':  ':bookmark_tabs: Reason',
          'value': reason,
          'inline': true,
        },
      ]
    }, false, false)


  return message.channel.send({embed})
}
