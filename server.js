// setup web server
const express = require('express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.use("/public", express.static(__dirname + "/public"));
// app.use('/', express.static(__dirname + "/views/"));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);