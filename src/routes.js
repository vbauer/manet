"use strict";

/**
 * TODO:
 * - Clipping Rectangle
 * - Asynchronous call
 */

var _ = require('lodash'),
    logger = require('winston'),
    fs = require('fs'),
    util = require('util'),
    utils = require('./utils'),

    DEF_ENGINE = 'slimerjs',
    DEF_COMMAND = 'slimerjs';


/* Functions to work with configurations/options */

function readOptions(data) {
    return _.pick(data, [
        'url', 'agent', 'delay', 'format',
        'width', 'height', 'zoom', 'quality',
        'js', 'images',
        'user', 'password'
    ]);
}

function outputFile(options, conf, base64) {
    var format = options.format || 'png';
    return util.format('%s/%s.%s', conf.storage, base64, format);
}

function cliCommand(config) {
    var engine = config.engine || DEF_ENGINE,
        command = config.command || config.commands[engine][process.platform];
    return command || DEF_COMMAND;
}


/* Screenshot capturing runner */

function runScreenshotCapturingProcess(options, config, outputFile, base64, onFinish) {
    var scriptFile = utils.filePath('scripts/screenshot.js'),
        command = cliCommand(config).split(/[ ]+/),
        cmd = _.first(command),
        args = _.union(_.rest(command), [scriptFile, base64, outputFile]);

    logger.debug('Options for script: %j, base64: %s', options, base64);
    utils.execProcess(cmd, args, onFinish);
}

function captureScreenshot(options, config, force, onFinish) {
    var base64 = utils.encodeBase64(options),
        file = outputFile(options, config, base64);

    logger.info('Capture site screenshot: %s', options.url);

    if (force || !fs.existsSync(file)) {
        runScreenshotCapturingProcess(options, config, file, base64, function () {
            logger.info('Process finished work: %s', base64);
            return onFinish(file);
        });
    } else {
        logger.debug('Take screenshot from file storage: %s', base64);
        return onFinish(file);
    }
}


/* Controllers */

function index(config) {
    return function (req, res) {
        var data = req.data,
            force = data.force === 'true',
            options = readOptions(data);

        return captureScreenshot(options, config, force, function (file) {
            return res.sendFile(file);
        });
    };
}


/* Export functions */

module.exports = {
    index: index
};
