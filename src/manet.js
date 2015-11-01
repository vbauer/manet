"use strict";

var _ = require('lodash'),
    express = require('express'),
    bodyParser = require('body-parser'),
    logger = require('winston'),
    fs = require('fs-extra'),
    helmet = require('helmet'),
    passport = require('passport'),
    config = require('./config'),
    routes = require('./routes'),
    filters = require('./filters'),
    utils = require('./utils'),

    DEF_LOGGER_LEVEL = 'info',
    DEF_LOGGER_SILENT = false;


/* Logging system */

function initLogging(conf) {
    logger.setLevels({
        error: 0,
        warn: 1,
        info: 2,
        verbose: 3,
        debug: 4,
        silly: 5
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
        colorize: true,
        timestamp: true
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


/* Init FS services */

function cleanupFsStorage(conf) {
    if (conf.cleanupStartup) {
        var storagePath = conf.storage,
            files = fs.readdirSync(storagePath);

        _.forEach(files, function(file) {
            var filePath = utils.filePath(file, storagePath);
            try {
                fs.removeSync(filePath, {force: true});
            } catch (err) {}
        });
    }
}

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

function initFsStorage(conf) {
    cleanupFsStorage(conf);
    initFsWatchdog(conf);
}


/* Web application */

function createWebApplication(conf) {
    var app = express(),
        index = routes.index(conf),
        urlencoded = bodyParser.urlencoded({ extended: false }),
        json = bodyParser.json(),
        noCache = helmet.noCache(),
        basic = filters.basic(conf),
        usage = filters.usage(conf),
        merge = filters.merge,
        notNull = function(f) {
            return _.without(f, null);
        };

    filters.configureWebSecurity(conf);

    app.use(express.static(utils.filePath('../public')));
    app.use(passport.initialize());

    app.get('/', notNull([basic, merge, usage, noCache]), index);
    app.post('/', notNull([basic, merge, usage, urlencoded, json, noCache]), index);

    return app;
}

function runWebServer(conf, onStart) {
    var app = createWebApplication(conf),
        host = conf.host,
        port = conf.port,
        server = app.listen(port, host, function () {
            if (onStart) {
                onStart(server);
            }
        });
    logger.info('Manet server started on %s:%d', host, port);
}


/* Initialize and run server */

function main(onStart) {
    var conf = config.read();

    initLogging(conf);
    initExitHandling();
    initFsStorage(conf);

    logger.debug('Default configuration file: %s', conf.path);
    logger.debug('Configuration parameters: %s', JSON.stringify(conf));

    runWebServer(conf, onStart);
}


/* Exported functions */

module.exports = {
    main: main
};
