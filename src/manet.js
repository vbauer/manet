"use strict";

var nconf = require('nconf'),
    express = require('express'),
    bodyParser = require('body-parser'),
    logger = require('winston'),
    path = require('path'),
    os = require('os'),
    fs = require('fs'),
    nocache = require('connect-nocache'),
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

function initLogging(config) {
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
        colorize: true,
        silent: config.silent || false
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


/* Init file system watchdog */

function initFsWatchdog(config) {
    var timeout = config.cache * 1000,
        dir = config.storage;

    utils.runFsWatchdog(dir, timeout, function (file) {
        return fs.unlink(file, function (err) {
            if (err) {
                return logger.error(err);
            }
            logger.info('Deleted file: %s', file);
        });
    });
}


/* Web service */

function createWebApplication(config) {
    var app = express(),
        controller = routes.index(config),
        urlencodedParser = bodyParser.urlencoded({ extended: false }),
        jsonParser = bodyParser.json();

    app.use(express.static(utils.filePath('../public')));

    app.get('/', nocache(), filters.usage, controller);
    app.post('/', urlencodedParser, jsonParser, nocache(), filters.usage, controller);

    return app;
}

function runWebServer(config, onStart) {
    var app = createWebApplication(config),
        server = app.listen(config.port, function () {
            if (onStart) {
                onStart(server);
            }
        });

    logger.info('Manet server started on port %d', config.port);
}


/* Initialize and run server */

function main(onStart) {
    var config = readConfiguration();

    initLogging(config);
    initExitHandling();
    initFsWatchdog(config);

    runWebServer(config, onStart);
}


/* Export functions */

module.exports = {
    readConfiguration: readConfiguration,

    main: main
};
