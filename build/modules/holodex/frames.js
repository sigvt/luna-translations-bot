"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStartTime = exports.isPublic = exports.getFrameList = void 0;
const ramda_1 = require("ramda");
const config_1 = require("../../config");
const helpers_1 = require("../../helpers");
const tryCatch_1 = require("../../helpers/tryCatch");
const { max, ceil } = Math;
async function getFrameList() {
    const firstPg = await getOneFramePage();
    const total = parseInt(firstPg?.total ?? '0');
    const remaining = max(0, ceil(total / 50) - 1);
    const otherPgs = await getFramePages({ offset: 1, limit: remaining });
    const frames = otherPgs?.flatMap?.(pg => pg?.items);
    const hasFailed = !firstPg || !otherPgs;
    return hasFailed ? [] : (0, helpers_1.removeDupeObjects)([...firstPg.items, ...frames]);
}
exports.getFrameList = getFrameList;
function isPublic(frame) {
    return frame.topic_id !== 'membersonly';
}
exports.isPublic = isPublic;
async function getStartTime(videoId) {
    // TODO: clean this up
    let attempts = 0;
    let data;
    while (attempts < 5) {
        const status = (0, helpers_1.isEven)(attempts) ? 'live' : 'past';
        data = await (0, tryCatch_1.asyncTryOrLog)(() => (0, helpers_1.getJson)(`https://holodex.net/api/v2/videos?status=${status}&include=live_info&type=stream&order=desc&id=${videoId}`, { headers: { 'X-APIKEY': config_1.config.holodexKey } }));
        if (data?.[0]?.start_actual == undefined)
            attempts += 1;
        else
            break;
    }
    return data?.[0]?.start_actual;
}
exports.getStartTime = getStartTime;
///////////////////////////////////////////////////////////////////////////////
const framesUrl = 'https://holodex.net/api/v2/live?';
const params = {
    include: 'description',
    limit: '50',
    paginated: '1',
    max_upcoming_hours: '999999'
};
function getOneFramePage() {
    const url = framesUrl + (0, helpers_1.Params)(params);
    return (0, tryCatch_1.asyncTryOrLog)(() => (0, helpers_1.getJson)(url, { headers: {
            'X-APIKEY': config_1.config.holodexKey
        } }));
}
async function getFramePages({ offset = 0, limit = 0 }) {
    // Use an imperative loop to delay each call so as not to spam the API
    try {
        const pages = [];
        for (const page of (0, ramda_1.range)(offset, limit)) {
            await (0, helpers_1.sleep)(1000);
            pages.push(await (0, helpers_1.getJson)(framesUrl + (0, helpers_1.Params)({ ...params, offset: (50 * page).toString() }), { headers: { 'X-APIKEY': config_1.config.holodexKey } }));
        }
        return pages;
    }
    catch (e) {
        (0, helpers_1.debug)(e);
        return undefined;
    }
}
//# sourceMappingURL=frames.js.map