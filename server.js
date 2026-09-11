const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

const {
    inspectVideo,
    downloadVideo,
    downloadAudio,
    downloadThumbnail,
    getCaptions,
    downloadCaption
} = require('./services/ytdlp');


app.use(express.urlencoded({ extended: true }));   
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index', { info: null});
});

app.post('/download', async (req, res)=>{
    const url = req.body.url;

    try{
        const info = await inspectVideo(url);

        res.render('index', {info});
    }
    catch(error){
        console.error(error);
        res.status(500).send("Could not inspect/find this video")
    }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});