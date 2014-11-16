
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
    utils = require('./utils');


/* Functions to work with configurations/options */

function readOptions(req) {
    return _.compactObject(
        _.filterByCollection(req.query, [
            'url', 'agent', 'delay', 'format',
            'width', 'height', 'zoom', 'quality',
            'js', 'images',
            'user', 'password'
        ])
    );
}

function encodeOptions(options) {
    return new Buffer(JSON.stringify(options), 'binary').toString('base64');
}

function outputFile(options, conf, base64) {
    var format = options.format || 'png';
    return util.format('%s/%s.%s', conf.storage, base64, format);
}

function cliCommand(conf) {
    var command = conf.command;
    var cmd = _.isObject(command) ? command[process.platform] : command;
    return cmd || 'slimerjs';
}


/* Screenshot capturing runner */

function runScreenshotCapturingProcess(options, conf, outputFile, base64, onFinish) {
    var scriptFile = utils.filePath('scripts/screenshot.js'),
        command = cliCommand(conf).split(/[ ]+/),
        cmd = _.first(command),
        args = _.union(_.rest(command), [scriptFile, base64, outputFile]);

    logger.debug('Options for SlimerJS script: %j, base64: %s', options, base64);
    utils.execProcess(cmd, args, onFinish);
}

function captureScreenshot(options, conf, force, onFinish) {
    var base64 = encodeOptions(options),
        file = outputFile(options, conf, base64);

    logger.info('Capture site screenshot: %s', options.url);

    if (force || !fs.existsSync(file)) {
        runScreenshotCapturingProcess(options, conf, file, base64, function () {
            logger.info('SlimerJS process finished work: %s', base64);
            return onFinish(file);
        });
    } else {
        logger.debug('Take screenshot from file storage: %s', base64);
        return onFinish(file);
    }
}


/* Controllers */

function index(conf) {
    return function (req, res) {
        var force = req.query.force === 'true',
            options = readOptions(req);

        return captureScreenshot(options, conf, force, function (file) {
            return res.sendFile(file);
        });
    };
}


/* Export functions */

module.exports.index = index;
