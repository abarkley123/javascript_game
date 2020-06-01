// setup web server
import express from 'express';
import path from 'path';
import fs from 'fs';
import config from "./config.json";
// import logger from "./public/js/logger.js";

// Constants
const PORT = config[process.env['NODE_ENV']].port;
const HOST = config[process.env['NODE_ENV']].host;

// setup config for the given environment (dev or prod)
(() => {
    let env = process.env['NODE_ENV'];
    let content = config[env], path = "./public/client_config.mjs";
    //create client config file
    fs.writeFile(path, "export default\n" + JSON.stringify(content), (err) => {
        if (err) throw err;
    })
})();

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');

    next();
}

// App
const app = express();
app.use(allowCrossDomain);
app.use("/public", express.static(path.resolve() + "/public"));


app.get('/', function(req, res) {
    res.sendFile(path.resolve() + '/views/index.html');
});

// serve audio files.
app.get("/audio", function(req, res) {
    sendFiles(res, path.resolve() + "/public/audio");
});

// serve audio files.
app.get("/images", function(req, res) {
    sendFiles(res, path.resolve() + "/public/images");
});

function sendFiles(res, path) {
    getFiles(path)
    .then(files => {
        // logger.log("Retrieved files: " + files, "info");
        res.status(200).send({
            success: 'true',
            message: files
        });
    }).catch(e => {
        res.status(500).send({
            success: 'false',
            message: str(e)
        });
    });
}

async function getFiles(dir = path.resolve() + "/public/") {
    var results = [];
    var list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir.replace(/\\/g, "/") + '/' + file;
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
// logger.log(`Running on http://${HOST}:${PORT}`, "info");

export default app;