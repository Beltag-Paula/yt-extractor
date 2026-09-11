const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

const {
    inspectVideo,
    downloadVideo,
    downloadAudio,
    downloadThumbnail,
    downloadCaption
} = require('./services/ytdlp');


app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.get('/', (req, res) => {
    res.render('index', {
        info: null
    });
});

app.post('/inspect', async (req, res) => {

    const url = req.body.url;

    try {

        const info = await inspectVideo(url);

        console.log(info);

        res.render('index', {
            info,
            url
        });

    } catch (error) {

        console.error(error);

        res.status(500).send('Could not inspect video');
    }
});


app.post('/download/video', async (req, res) => {

    const url = req.body.url;
    const quality = req.body.quality;

    try {

        const file = await downloadVideo(url, quality);

        console.log('Video downloaded:', file);

        res.download(file);

    } catch (error) {

        console.error(error);

        res.status(500).send('Could not download video');
    }
});


app.post('/download/audio', async (req, res) => {

    const url = req.body.url;
    const quality = req.body.quality;

    try {

        const file = await downloadAudio(url, quality);

        console.log('Audio downloaded:', file);

        res.download(file);

    } catch (error) {

        console.error(error);

        res.status(500).send('Could not download audio');
    }
});


app.post('/download/caption', async (req, res) => {

    const url = req.body.url;
    const [language, type] = req.body.language.split('|');

    try {

        const file = await downloadCaption(
            url,
            language,
            type
        );

        console.log('Caption downloaded:', file);

        res.download(file);

    } catch (error) {

        console.error(error);

        res.status(500).send('Could not download caption');
    }
});


app.post('/download/thumbnail', async (req, res) => {

    const url = req.body.url;

    try {

        const file = await downloadThumbnail(url);

        console.log('Thumbnail downloaded:', file);

        res.download(file);

    } catch (error) {

        console.error(error);

        res.status(500).send('Could not download thumbnail');
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});