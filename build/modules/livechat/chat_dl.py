import pytchat
import sys
import json

video_code = sys.argv[1]
log = open(f"./logs/{video_code}.jsonl", "a")

chat = pytchat.create(video_id=video_code)
while chat.is_alive():
    for c in chat.get().sync_items():
        tl_bot_obj = json.dumps({
            "id": c.author.channelId,
            "name": c.author.name,
            "body": c.message,
            "time": c.timestamp,
            "isMod": c.author.isChatModerator,
            "isOwner": c.author.isChatOwner,
        })

        archive_obj = json.dumps({
            "id": c.author.channelId,
            "name": c.author.name,
            "body": c.message,
            "time": c.timestamp,
            "isMod": c.author.isChatModerator,
            "isOwner": c.author.isChatOwner,
            "isMember": bool(c.author.badgeUrl),
            "badge": c.author.badgeUrl,
            "superchatValue": c.amountValue,
            "superchatCurrency": c.currency,
        })
        print(tl_bot_obj)
        log.write(archive_obj+"\n")
        log.flush()
