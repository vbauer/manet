"use strict";

/**
 * TODO:
 * - Clipping Rectangle
 * - Asynchronous call
 */

var _ = require('lodash'),
    joi = require('joi'),
    capture = require('./capture'),
    utils = require('./utils');


/* Schemas */

function createSchema() {
    return joi.object().keys({
        force: joi.boolean(),
        url: joi.string().required(),
        agent: joi.string(),
        delay: joi.number().integer().min(0),
        format: joi.string().lowercase().allow('jpg', 'jpeg', 'png', 'pdf', 'gif'),
        quality: joi.number().min(0).max(1),
        width: joi.number().integer().min(1),
        height: joi.number().integer().min(1),
        zoom: joi.number().min(0).max(1),
        js: joi.boolean(),
        images: joi.boolean(),
        user: joi.string(),
        password: joi.string()
    });
}


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
        var data = utils.validate(req.data, createSchema);
        if (data.error) {
            return res.json(data.error.details);
        } else {
            var options = readOptions(data.value);
            return capture.screenshot(options, config, function (file) {
                return res.sendFile(file);
            });
        }
    };
}


/* Exported functions */

module.exports = {
    index: index
};
