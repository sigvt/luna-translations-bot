import pytchat
import sys
import json

video_code = sys.argv[1]
log = open(f"./logs/{video_code}.txt", "a")

chat = pytchat.create(video_id=video_code)
while chat.is_alive():
    for c in chat.get().sync_items():
        msg_obj = json.dumps({
            "id": c.author.channelId,
            "name": c.author.name,
            "body": c.message,
            "time": c.timestamp,
            "isMod": c.author.isChatModerator,
            "isOwner": c.author.isChatOwner,
        })
        print(msg_obj)
        log.write(msg_obj+"\n")
        log.flush()
