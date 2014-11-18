"use strict";

var _ = require('lodash'),
    fs = require('fs'),
    logger = require('winston'),
    util = require('util'),
    utils = require('./utils'),

    SCRIPT_FILE = 'scripts/screenshot.js',

    DEF_ENGINE = 'slimerjs',
    DEF_COMMAND = 'slimerjs',
    DEF_FORMAT = 'png';


/* Configurations */

function outputFile(options, conf, base64) {
    var format = options.format || DEF_FORMAT;
    return util.format('%s/%s.%s', conf.storage, base64, format);
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
        cmd = _.first(command),
        args = _.union(_.rest(command), [scriptFile, base64, outputFile]);

    logger.debug('Options for script: %j, base64: %s', options, base64);
    utils.execProcess(cmd, args, onFinish);
}

function screenshot(options, config, onFinish) {
    var opts = _.omit(options, 'force'),
        base64 = utils.encodeBase64(opts),
        file = outputFile(opts, config, base64),
        force = options.force === 'true';

    logger.info('Capture site screenshot: %s', options.url);

    if (force || !fs.existsSync(file)) {
        runCapturingProcess(opts, config, file, base64, function () {
            logger.info('Process finished work: %s', base64);
            return onFinish(file);
        });
    } else {
        logger.debug('Take screenshot from file storage: %s', base64);
        return onFinish(file);
    }
}


/* Exported functions */

module.exports = {
    screenshot: screenshot
};
