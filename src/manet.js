"use strict";

var express = require('express'),
    bodyParser = require('body-parser'),
    logger = require('winston'),
    fs = require('fs'),
    nocache = require('connect-nocache'),
    config = require('./config'),
    routes = require('./routes'),
    filters = require('./filters'),
    utils = require('./utils'),

    DEF_LOGGER_LEVEL = 'debug',
    DEF_LOGGER_SILENT = false;


/* Logging system */

function initLogging(conf) {
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
        level: conf.level || DEF_LOGGER_LEVEL,
        silent: conf.silent || DEF_LOGGER_SILENT,
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


/* Init file system watchdog */

function initFsWatchdog(conf) {
    var timeout = conf.cache * 1000,
        dir = conf.storage;

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

function addUsage(conf, chain) {
    if (conf.ui) {
        chain.push(filters.usage);
    }
    return chain;
}

function createWebApplication(conf) {
    var app = express(),
        index = routes.index(conf),
        urlencoded = bodyParser.urlencoded({
            extended: false
        }),
        json = bodyParser.json();

    app.use(express.static(utils.filePath('../public')));

    app.get('/', addUsage(conf, [nocache(), filters.merge]), index);
    app.post('/', addUsage(conf, [urlencoded, json, nocache(), filters.merge]), index);

    return app;
}

function runWebServer(conf, onStart) {
    var app = createWebApplication(conf),
        server = app.listen(conf.port, function () {
            if (onStart) {
                onStart(server);
            }
        });

    logger.info('Manet server started on port %d', conf.port);
}


/* Initialize and run server */

function main(onStart) {
    var conf = config.read();

    initLogging(conf);
    initExitHandling();
    initFsWatchdog(conf);

    runWebServer(conf, onStart);
}


/* Exported functions */

module.exports = {
    main: main
};
