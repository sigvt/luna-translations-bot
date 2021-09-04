"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tl = void 0;
const config_1 = require("../config");
const tryCatch_1 = require("../helpers/tryCatch");
const helpers_1 = require("../helpers/");
async function tl(text) {
    const tlObject = await (0, tryCatch_1.asyncTryOrLog)(() => (0, helpers_1.getJson)('https://api-free.deepl.com/v2/translate', {
        body: `auth_key=${config_1.config.deeplKey}&text=${text}&target_lang=EN`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        method: 'POST',
    }));
    const hasTl = tlObject?.translations !== undefined;
    const wasEng = tlObject?.translations?.[0].detected_source_language === 'EN';
    return (wasEng && hasTl) ? text : (tlObject?.translations?.[0].text ?? text);
}
exports.tl = tl;
//# sourceMappingURL=deepl.js.map