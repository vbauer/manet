
(function() {
"use strict";

    /**
     * TODO:
     * - Clipping Rectangle
     * - Asynchronous call
     */

    var _ = require('lodash'),
        colors = require('colors/safe'),
        btoa = require('btoa'),
        fs = require('fs'),
        util = require('util'),
        utils = require('./utils');


    /* Functions to work with configurations/options */

    function readOptions(req) {
        return _.compactObject(
            _.filterByCollection(req.query, [
                'url', 'agent', 'delay',
                'width', 'height', 'zoom',
                'js', 'images',
                'user', 'password'
            ])
        );
    }

    function encodeOptions(options) {
        return btoa(JSON.stringify(options));
    }

    function outputFile(conf, base64) {
        return utils.filePath(util.format('../%s/%s.png', conf.output.directory, base64));
    }


    /* Screenshot capturing runner */

    function runScreenshotCapturingProcess(outputFile, base64, options, conf, onFinish) {
        var scriptFile = utils.filePath('../scripts/screenshot.js'),
            command = (conf.command[process.platform] || 'slimerjs').split(/[ ]+/),
            cmd = _.first(command),
            args = _.union(_.rest(command), [scriptFile, base64, outputFile]);

        console.log(colors.debug('Options for SlimerJS script: %j, base64: %s'), options, base64);
        utils.execProcess(cmd, args, onFinish);
    }

    function captureScreenshot(options, conf, force, onFinish) {
        var base64 = encodeOptions(options),
            file = outputFile(conf, base64);

        console.log(colors.info('Capture site screenshot: %s'), options.url);

        if (force || !fs.existsSync(file)) {
            runScreenshotCapturingProcess(file, base64, options, conf, function (code) {
                console.log(colors.info('SlimerJS process finished work, code: %j'), code);
                return onFinish(file);
            });
        } else {
            console.log(colors.debug('Take screenshot from file storage: %s'), base64);
            return onFinish(file);
        }
    }


    /* Controllers */

    function index(conf) {
        return function (req, res /*, next*/) {
            var force = (req.query.force || '').toLocaleLowerCase() === 'true',
                options = readOptions(req);

            return captureScreenshot(options, conf, force, function (file) {
                return res.status(200).sendFile(file);
            });
        };
    }


    /* Export functions */

    module.exports.index = index;

})();
