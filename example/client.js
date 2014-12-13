"use strict";

/**
 * Example shows how to make asynchronous screenshot.
 *
 * @author: Vladislav Bauer
 */

var http = require('http'),
    path = require('path'),
    url = require('url'),
    fs = require('fs'),

    DEF_MANET_HOST = 'localhost',
    DEF_MANET_PORT = 8891,
    DEF_CLIENT_HOST = 'localhost',
    DEF_CLIENT_PORT = 8892,
    DEF_DELAY = 5000,
    DEF_CALLBACK = 'http://' + DEF_CLIENT_HOST + ':' + DEF_CLIENT_PORT + '/',
    DEF_SITES_URL = [
        'https://www.github.com',
        'https://www.twitter.com'
    ];


/**
 * Generate full URL to the screenshot service.
 */
function screenshotServiceUrl(siteUrl) {
    return url.format({
        protocol: 'http',
        hostname: DEF_MANET_HOST,
        port: DEF_MANET_PORT,
        query: {
            callback: DEF_CALLBACK,
            url: siteUrl,
            force: true
        }
    });
}

/**
 * Call the Manet using the current server as a callback.
 */
function captureScreenshot(siteUrl) {
    var serviceUrl = screenshotServiceUrl(siteUrl);

    console.log('Sending request to capture screenshot from %s', siteUrl);
    http.get(serviceUrl, function (res) {
        console.log('Screenshot from %s was captured with status %s', siteUrl, res.statusCode);
    });
    console.log('Request to capture screenshot from %s was sent', siteUrl);
}

/**
 * Start HTTP requests poller.
 */
function startPoller() {
    setInterval(function () {
        for (var i = 0; i < DEF_SITES_URL.length; i++) {
            captureScreenshot(DEF_SITES_URL[i]);
        }
    }, DEF_DELAY);
}

/**
 * Start client HTTP server.
 */
function startServer() {
    http.createServer(function (req, res) {
        var fileName = __dirname + path.sep + new Date().getTime() + '.png';

        req.on('end', function () {
            res.writeHead(200);
            res.end();
        });
        req.pipe(fs.createWriteStream(fileName));
    }).listen(DEF_CLIENT_PORT);

    console.log("Client server running on port 8124");
}

/**
 * Prepare and start all application components.
 */
function startApplication() {
    startServer();
    startPoller();
}


// Run client application.
startApplication();
