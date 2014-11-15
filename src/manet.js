
"use strict";

var nconf = require('nconf'),
    express = require('express'),
    logger = require('winston'),
    nocache = require('connect-nocache')(),
    routes = require('./routes'),
    filters = require('./filters'),
    utils = require('./utils');


/* Read configuration system */

function readConfiguration() {
    return nconf.argv()
        .env()
        .file({
            file: utils.filePath('config/default.json')
        })
        .get();
}


/* Logging system */

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
        info: 'cyan',
        silly: 'magenta',
        warn: 'yellow',
        error: 'red'
    });

    logger.remove(logger.transports.Console);
    logger.add(logger.transports.Console, {
        level: 'debug',
        colorize: true
    });
}


/* Termination & Errors handling */

function initExitHandling() {
    var onExit = function () {
        process.exit(0);
    };
    process.on('SIGTERM', onExit);
    process.on('SIGINT', onExit);
}


/* Web service */

function runWebServer() {
    var conf = readConfiguration(),
        app = express();

    app.use(express.static(__dirname + '../public'));
    app.get('/', nocache, filters.usage, routes.index(conf));
    app.listen(conf.port);

    logger.info('Manet server started on port %d', conf.port);
}


/* Initialize and run server */

function main() {
    initLogging();
    initExitHandling();
    runWebServer();
}


/* Export functions */

module.exports.main = main;
