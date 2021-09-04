"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestPost = void 0;
const helpers_1 = require("../../helpers");
async function getLatestPost(channelId) {
    const channelUrl = `https://www.youtube.com/channel/${channelId}/community`;
    const headers = { 'Accept-Language': 'en' };
    const page = await (0, helpers_1.getText)(channelUrl, { headers });
    const dataRegex = /(?<=var ytInitialData = )(.*?)(?=;<\/script>)/;
    const data = JSON.parse(page.match(dataRegex)?.[0] ?? '');
    return extractYtData(data, channelId);
}
exports.getLatestPost = getLatestPost;
///////////////////////////////////////////////////////////////////////////////
function extractYtData(ytData, ytId) {
    const latestPost = ytData.contents
        ?.twoColumnBrowseResultsRenderer
        .tabs[3]
        .tabRenderer
        .content
        .sectionListRenderer
        .contents[0]
        .itemSectionRenderer
        .contents[0]
        .backstagePostThreadRenderer
        ?.post
        .backstagePostRenderer;
    const textEls = latestPost?.contentText.runs;
    const postText = textEls?.map(el => el.text).join(' ');
    const truncated = postText?.length < 2000 ? postText
        : postText?.substr(0, 1999) + '…';
    const date = latestPost?.publishedTimeText.runs[0].text;
    return latestPost ? {
        ytId,
        author: latestPost.authorText.runs[0].text,
        avatar: `https:${latestPost.authorThumbnail.thumbnails[2].url}`,
        url: `https://youtube.com/post/${latestPost.postId}`,
        content: truncated,
        isToday: ['day', 'week', 'month', 'year'].every(unit => !date.includes(unit))
    } : undefined;
}
//# sourceMappingURL=getLatestPost.js.map