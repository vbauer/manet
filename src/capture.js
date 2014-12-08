"use strict";

var _ = require('lodash'),
    fs = require('fs'),
    logger = require('winston'),
    path = require('path'),
    utils = require('./utils'),

    SCRIPT_FILE = 'scripts/screenshot.js',

    DEF_ENGINE = 'slimerjs',
    DEF_COMMAND = 'slimerjs',
    DEF_FORMAT = 'png';


/* Configurations */

function outputFile(options, conf, base64) {
    var format = options.format || DEF_FORMAT;
    return conf.storage + path.sep + base64 + '.' + format;
}

function cliCommand(config) {
    var engine = config.engine || DEF_ENGINE,
        command = config.command || config.commands[engine][process.platform];
    return command || DEF_COMMAND;
}


/* Screenshot capturing runner */

function runCapturingProcess(options, config, outputFile, base64, onFinish) {
    var scriptFile = utils.filePath(SCRIPT_FILE),
        command = cliCommand(config).split(/[ ]+/),
        cmd = _.union(command, [scriptFile, base64, outputFile]),
        opts = {
            timeout: config.timeout
        };

    logger.debug('Options for script: %j, base64: %s', options, base64);
    utils.execProcess(cmd, opts, onFinish);
}

function screenshot(options, config, onFinish) {
    var opts = _.omit(options, 'force'),
        base64 = utils.encodeBase64(opts),
        file = outputFile(opts, config, base64);

    logger.info('Capture site screenshot: %s', options.url);

    if (options.force || !fs.existsSync(file)) {
        runCapturingProcess(opts, config, file, base64, function (code) {
            logger.debug('Process finished work: %s', base64);
            return onFinish(file, code);
        });
    } else {
        logger.debug('Take screenshot from file storage: %s', base64);
        return onFinish(file, 0);
    }
}


/* Exported functions */

module.exports = {
    screenshot: screenshot
};
