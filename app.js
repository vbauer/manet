
"use strict";

var config = require('config'),
    colors = require('colors/safe'),
    express = require('express'),
    nocache = require('connect-nocache')(),
    routes = require('./app/routes'),
    filters = require('./app/filters');


// Configure terminal
function initTerminal() {
    colors.setTheme({
        info: 'green',
        notice: 'blue',
        warn: 'yellow',
        error: 'red',
        debug: 'cyan'
    });
}


// Termination & Errors handling
function initExitHandling() {
    var onExit = function () {
        process.exit(0);
    };
    process.on('SIGTERM', onExit);
    process.on('SIGINT', onExit);
}


// Web service
function initWebServer() {
    var conf = config.get('manet'),
        app = express();

    app.use(express.static(__dirname + '/public'));
    app.get('/', nocache, filters.usage, routes.index(conf));
    app.listen(conf.port);

    console.log(
        colors.notice('Manet server started on %s with configuration: %s'),
        process.platform, JSON.stringify(conf, null, '\t')
    );
}


/* Initialize and run server */

initExitHandling();
initTerminal();
initWebServer();
