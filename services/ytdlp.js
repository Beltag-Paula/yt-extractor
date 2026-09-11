const { YtDlp } = require('ytdlp-nodejs'); //https://www.npmjs.com/package/ytdlp-nodejs
const fs = require('fs');

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
        channel: info.uploader,
        duration: info.duration,
        thumbnail: bestThumbnail?.url,

        videoFormats,
        audioFormats,

        subtitles,
        automaticCaptions
    };
};


//download video based on 3 types of quality
const downloadVideo = async (url, quality) => {

    const qualities = {
        low: '480p',
        medium: '720p',
        best: 'highest'
    };

    if (!qualities[quality]) {
        throw new Error('Invalid video quality');
    }

    const result = await ytdlp.downloadAsync(url, {
        format: {
            filter: 'mergevideo',
            quality: qualities[quality],
            type: 'mp4'
        },
        output: './downloads/%(title)s.%(ext)s'
    });

    return result.filePaths[0];
};

//download audio based on 3 types of quality
const downloadAudio = async (url, quality) => {

    const qualities = {
        low: 5,
        medium: 3,
        best: 1
    };

    if (!qualities[quality]) {
        throw new Error('Invalid audio quality');
    }

    const result = await ytdlp.downloadAsync(url, {
        format: {
            filter: 'audioonly',
            quality: qualities[quality],
            type: 'mp3'
        },
        output: './downloads/%(title)s.%(ext)s'
    });

    return result.filePaths[0];
};


//download thumbnail
const downloadThumbnail = async (url) => {

    const info = await ytdlp.getInfoAsync(url);

    const bestThumbnail = info.thumbnails
        ?.filter(thumbnail => thumbnail.width && thumbnail.height)
        .sort((a, b) =>
            (b.width * b.height) - (a.width * a.height)
        )[0];

    if (!bestThumbnail) {
        throw new Error('No thumbnail found');
    }

    const response = await fetch(bestThumbnail.url);

    if (!response.ok) {
        throw new Error('Could not download thumbnail');
    }

    const buffer = Buffer.from(
        await response.arrayBuffer()
    );

    const filename = `./downloads/${info.id}.jpg`;

    fs.writeFileSync(filename, buffer);

    return filename;
};


//find available caption of that video
const getCaptions = async (url) => {

    const info = await ytdlp.getInfoAsync(url);

    return {
        subtitles: Object.keys(info.subtitles || {}),

        automaticCaptions: Object.keys(
            info.automatic_captions || {}
        )
    };
};


//after that use this to download selected caption
const downloadCaption = async (url, language, type) => {

    const options = {
        output: './downloads/%(title)s.%(ext)s',
        subLangs: [language],
        convertSubs: 'srt',
        skipDownload: true
    };

    if (type === 'subtitle') {
        options.writeSubs = true;
    }

    if (type === 'automatic') {
        options.writeAutoSubs = true;
    }

    if (!fs.existsSync('./downloads')) {
        fs.mkdirSync('./downloads', { recursive: true });
    }

    const before = new Set(fs.readdirSync('./downloads'));

    await ytdlp.downloadAsync(url, options);

    const after = fs.readdirSync('./downloads');

    const newFile = after.find(file =>
        !before.has(file) && file.endsWith('.srt')
    );

    if (!newFile) {
        throw new Error('Could not find downloaded caption file');
    }

    return `./downloads/${newFile}`;
};


//just wrote to see what is the full JSON and stored into output.txt, not useful
/*const saveJsonToTxtNode = (jsonData, filename) => {
    // 1. Convert JSON object to a formatted string
    const jsonString = JSON.stringify(jsonData, null, 2);

    // 2. Write directly to the file system
    fs.writeFileSync(filename, jsonString, 'utf8');
    console.log(`File saved as ${filename}`);
}*/



module.exports = {
    inspectVideo,
    downloadVideo,
    downloadAudio,
    downloadThumbnail,
    getCaptions,
    downloadCaption
};