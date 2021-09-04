"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleSetting = void 0;
const discord_1 = require("../../../helpers/discord");
const guildSettings_1 = require("./guildSettings");
function toggleSetting(props) {
    const settings = (0, guildSettings_1.getSettings)(props.msg);
    const current = settings[props.setting];
    const notice = current === true ? props.disable : props.enable;
    (0, guildSettings_1.updateSettings)(props.msg, { [props.setting]: !current });
    (0, discord_1.reply)(props.msg, (0, discord_1.createEmbedMessage)(notice));
}
exports.toggleSetting = toggleSetting;
//# sourceMappingURL=toggles.js.map