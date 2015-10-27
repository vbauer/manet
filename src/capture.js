"use strict";

var _ = require('lodash'),
    fs = require('fs-extra'),
    logger = require('winston'),
    path = require('path'),
    squirrel = require('squirrel'),
    crypto = require('crypto'),
    utils = require('./utils'),

    SCRIPT_FILE = 'scripts/screenshot.js',

    DEF_ENGINE = 'phantomjs',
    DEF_COMMAND = 'phantomjs',
    DEF_FORMAT = 'png';


/* Configurations and options */

function outputFile(options, conf) {
    var json = JSON.stringify(options),
        sha1 = crypto.createHash('sha1').update(json).digest('hex'),
        format = options.format || DEF_FORMAT;
    return conf.storage + path.sep + sha1 + '.' + format;
}

function cliCommand(config) {
    var engine = config.engine || DEF_ENGINE,
        command = config.command || config.commands[engine][process.platform];
    return command || DEF_COMMAND;
}

function createOptions(options, config) {
    var opts = _.omit(options, ['force', 'callback']);
    opts.url = utils.fixUrl(options.url);
    return _.defaults(opts, config.options);
}

function createConfig(options, config) {
    var conf = _.cloneDeep(config),
        engine = options.engine;
    conf.engine = engine || conf.engine;
    return conf;
}


/* Image processing */

function minimizeImage(src, dest, cb) {
    var iminModules = [
        'imagemin',
        'imagemin-gifsicle',
        'imagemin-jpegtran',
        'imagemin-optipng',
        'imagemin-svgo'
    ],
    options = {
        allowInstall: true
    };

    squirrel(iminModules, options, function(err, Imagemin) {
        var safeCb = function (err) {
            if (err) {
                logger.error(err);
            }
            cb();
        };

        if (err) {
            safeCb(err);
        } else {
            var imin = new Imagemin()
                .src(src)
                .dest(dest)
                .use(Imagemin.jpegtran({progressive: true}))
                .use(Imagemin.optipng({optimizationLevel: 3}))
                .use(Imagemin.gifsicle({interlaced: true}))
                .use(Imagemin.svgo());

            imin.run(safeCb);
        }
    });
}


/* Screenshot capturing runner */

function runCapturingProcess(options, config, outputFile, base64, onFinish) {
    var scriptFile = utils.filePath(SCRIPT_FILE),
        command = cliCommand(config).split(/[ ]+/),
        cmd = _.union(command, [scriptFile, base64, outputFile]),
        opts = {
            timeout: config.timeout
        };

    logger.debug(
        'Options for script: %s, base64: %s, command: %s',
        JSON.stringify(options), base64, JSON.stringify(cmd)
    );

    utils.execProcess(cmd, opts, function(error) {
        if (config.compress) {
            minimizeImage(outputFile, config.storage, function() {
                onFinish(error);
            });
        } else {
            onFinish(error);
        }
    });
}


/* External API */

function screenshot(options, config, onFinish) {
    var conf = createConfig(options, config),
        opts = createOptions(options, config),
        base64 = utils.encodeBase64(opts),
        file = outputFile(opts, conf),

        retrieveImageFromStorage = function () {
            logger.debug('Take screenshot from file storage: %s', base64);
            onFinish(file, null);
        },
        retrieveImageFromSite = function () {
            runCapturingProcess(opts, conf, file, base64, function (error) {
                logger.debug('Process finished work: %s', base64);
                return onFinish(file, error);
            });
        };

    logger.info('Capture site screenshot: %s', options.url);

    if (options.force || !conf.cache) {
        retrieveImageFromSite();
    } else {
        fs.exists(file, function (exists) {
            if (exists) {
                retrieveImageFromStorage();
            } else {
                retrieveImageFromSite();
            }
        });
    }
}


/* Exported functions */

module.exports = {
    screenshot: screenshot
};
