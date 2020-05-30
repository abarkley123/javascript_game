// setup web server
import express from 'express';
import path from 'path';
import * as fs from 'fs';

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.use("/public", express.static(path.resolve() + "/public"));

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

async function getAudioFiles(dir = path.resolve() + "/public/audio") {
    var results = [];
    var list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            /* Recurse into a subdirectory */
            results = results.concat(walk(file));
        } else { 
            /* Is a file */
            results.push(file);
        }
    });
    return results;
}

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);