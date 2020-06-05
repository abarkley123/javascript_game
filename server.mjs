// setup web server
import express from 'express';
import path from 'path';
import fs from 'fs';
import config from "./config.json";
import log from "./public/js/logger.mjs";

// Constants
const PORT = config[process.env['NODE_ENV']].port;
const HOST = config[process.env['NODE_ENV']].host;

// setup config for the given environment (dev or prod)
(() => {
    let env = process.env['NODE_ENV'];
    let content = JSON.stringify(config[env]), path = "./public/client_config.mjs";
    //create client config file
    if (env !== "test") {
        fs.writeFile(path, "export default\n" + content, (err) => {
            if (err) throw err;
            log(`Successfully wrote ${env} config to ` + path + "\n" + content, "info");
        })
    }
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

// serve image files.
app.get("/images", function(req, res) {
    sendFiles(res, path.resolve() + "/public/images");
});

function sendFiles(res, path) {
    getFiles(path)
    .then(files => {
        log("Retrieved files: " + files, "debug");
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
log(`Started server - running on http://${HOST}:${PORT}`, "debug");

export default app;