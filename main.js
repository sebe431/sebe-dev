const express = require('express');
const http = require('http');
const path = require('path');
const app = express();
const port = 3000;

async function start() {
    app.use(express.json()); // to support JSON-encoded bodies
    app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies

    // Endpoints go here

    app.set('port', port);
    app.use('/', express.static(__dirname + '/static'));
    app.listen(port, () => console.log('Website on port ' + port));
}

start();