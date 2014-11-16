"use strict";

var nconf = require('nconf'),
    express = require('express'),
    logger = require('winston'),
    path = require('path'),
    os = require('os'),
    fs = require('fs'),
    nocache = require('connect-nocache')(),
    routes = require('./routes'),
    filters = require('./filters'),
    utils = require('./utils');


/* Read configuration system */

function readConfiguration() {
    var config = nconf.argv()
        .env()
        .file({
            file: utils.filePath('config/default.json')
        })
        .get();

    config.storage = path.resolve(config.storage || os.tmpdir());

    return config;
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

function runWebServer(config) {
    var app = express();

    app.use(express.static(utils.filePath('../public')));
    app.get('/', nocache, filters.usage, routes.index(config));
    app.listen(config.port);

    logger.info('Manet server started on port %d', config.port);
}


/* Init file system watchdog */

function initFsWatchdog(config) {
    var timeout = config.cache * 1000,
        dir = config.storage;

    utils.runFsWatchdog(dir, timeout, function(file) {
        return fs.unlink(file, function (err) {
            if (err) {
                return logger.error(err);
            }
            logger.info('Deleted file: %s', file);
        });
    });
}


/* Initialize and run server */

function main() {
    var config = readConfiguration();

    initLogging();
    initExitHandling();
    initFsWatchdog(config);

    runWebServer(config);
}


/* Fire starter */

main();
