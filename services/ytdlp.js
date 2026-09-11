const { YtDlp } = require('ytdlp-nodejs');

const ytdlp = new YtDlp();

//u get info about yt videos
const inspectVideo = async (url) => {
    const info = await ytdlp.getInfoAsync(url);

    const videoFormats = info.formats.filter(format =>
        format.vcodec !== 'none'
    );

    const audioFormats = info.formats.filter(format =>
        format.acodec !== 'none'
    );

    const bestThumbnail = info.thumbnails
        ?.filter(thumbnail => thumbnail.width && thumbnail.height)
        .sort((a, b) =>
            (b.width * b.height) - (a.width * a.height)
        )[0];

    const subtitles = Object.keys(info.subtitles || {});
    const automaticCaptions = Object.keys(
        info.automatic_captions || {}
    );

    return {
        title: info.title,
        duration: info.duration,
        thumbnail: bestThumbnail?.url,

        videoFormats,
        audioFormats,

        subtitles,
        automaticCaptions
    };
};
//download video
const downloadVideo = (url, quality) => { }
//download audio
const downloadAudio = (url, quality) => { }
//download thumbnail
const downloadThumbnail = (url) => { }
//find available caption of that vide
const getCaptions = (url) => { }
//after that use this to download selected caption
const downloadCaption = (url, language) => { }

module.exports = {
    inspectVideo,
    downloadVideo,
    downloadAudio,
    downloadThumbnail,
    getCaptions,
    downloadCaption
};