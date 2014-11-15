
"use strict";

var config = require('config'),
    express = require('express'),
    logger = require('winston'),
    nocache = require('connect-nocache')(),
    routes = require('./app/routes'),
    filters = require('./app/filters');


// Logging system
function initLogging() {
    logger.setLevels({
        debug: 0,
        info: 1,
        silly: 2,
        warn: 3,
        error: 4
    });
    logger.addColors({
        debug: 'green',
        info:  'cyan',
        silly: 'magenta',
        warn:  'yellow',
        error: 'red'
    });

    logger.remove(logger.transports.Console);
    logger.add(logger.transports.Console, {
        level: 'debug',
        colorize:true
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

    logger.info(
        'Manet server started on %s with configuration: %s',
        process.platform, JSON.stringify(conf, null, '\t')
    );
}


/* Initialize and run server */
initLogging();
initExitHandling();
initWebServer();
