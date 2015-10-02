"use strict";

var _ = require('lodash'),
    express = require('express'),
    bodyParser = require('body-parser'),
    logger = require('winston'),
    fs = require('fs-extra'),
    helmet = require('helmet'),
    cluster = require('cluster'),
    config = require('./config'),
    routes = require('./routes'),
    filters = require('./filters'),
    utils = require('./utils'),

    DEF_LOGGER_LEVEL = 'info',
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


/* Init FS services */

function cleanupFsStorage(conf) {
    if (conf.cleanup) {
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
        json = bodyParser.json(),
        noCache = helmet.noCache();

    app.use(express.static(utils.filePath('../public')));

    app.get('/', addUsage(conf, [noCache, filters.merge]), index);
    app.post('/', addUsage(conf, [urlencoded, json, noCache, filters.merge]), index);

    return app;
}

function listen(conf, onStart, app) {
    var server = app.listen(conf.port, conf.host, function () {
        if (onStart) {
            onStart(server);
        }
    });
}

function runWebServer(conf, onStart) {
    var app = createWebApplication(conf);
    var workers = conf.workers;

    if (workers && workers > 1) {
        if (cluster.isMaster) {
            cluster.on('exit', function(worker) {
                console.warn('worker %d suddenly died, respawning', worker.process.pid);
                cluster.fork();
            });

            for (var i = 0; i < workers; i++) {
                cluster.fork();
            }

            logger.info(
                'Manet server cluster started on port %d with %d workers',
                conf.port, workers
            );
        } else {
            listen(conf, onStart, app);
            logger.info('Worker %d started', process.pid);
        }
    } else {
        listen(conf, onStart, app);
        logger.info('Manet server started on port %d', conf.port);
    }
}


/* Initialize and run server */

function main(onStart) {
    var confPath = config.defaultConfigPath(),
        conf = config.read();

    initLogging(conf);
    initExitHandling();
    initFsStorage(conf);

    logger.debug('Default configuration file: %s', confPath);
    logger.debug('Configuration parameters: %s', JSON.stringify(conf));

    runWebServer(conf, onStart);
}


/* Exported functions */

module.exports = {
    main: main
};
