"use strict";

/**
 * TODO:
 * - Clipping Rectangle
 * - Asynchronous call
 */

var _ = require('lodash'),
    capture = require('./capture');


/* Options */

function readOptions(data) {
    return _.pick(data, [
        'force',
        'url', 'agent', 'delay',
        'format', 'quality',
        'width', 'height', 'zoom',
        'js', 'images',
        'user', 'password'
    ]);
}


/* Controllers */

function index(config) {
    return function (req, res) {
        var data = req.data,
            options = readOptions(data);

        return capture.screenshot(options, config, function (file) {
            return res.sendFile(file);
        });
    };
}


/* Export functions */

module.exports = {
    index: index
};
