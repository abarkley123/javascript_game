// setup web server
import express from 'express';
import path from 'path';
import readdir from 'fs';

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.use("/public", express.static(path.resolve() + "/public"));
// app.use('/', express.static(__dirname + "/views/"));

app.get('/', function(req, res) {
    res.sendFile(path.resolve() + '/views/index.html');
});

// serve audio files.
app.get("/audio", function(req, res) {
    getAudioFiles()
    .then(files => {
        res.status(200).send({
            success: 'true',
            message: files
        });
    }).catch(e => {return e;});
});

async function getAudioFiles(dir = "/c/Users/Andy/Desktop/Git/javascript_game/public/audio/") {
    console.log(dir);
    const dirents = await readdir(dir, { withFileTypes: true });
    console.log(dirents);
    const files = await Promise.all(dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    }));
    console.log(files);
    return Array.prototype.concat(...files);
}

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);