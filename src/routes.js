"use strict";

/**
 * TODO:
 * - Asynchronous call
 */

var _ = require('lodash'),
    qs = require('qs'),
    joi = require('joi'),
    capture = require('./capture'),
    utils = require('./utils'),

    OUTPUT_FORMATS = ['jpg', 'jpeg', 'png', 'pdf', 'gif'],
    REGEXP_CLIP_RECT = /^(\d*),(\d*),([1-9]\d*),([1-9]\d*)$/;


/* Schemas */

function createSchema() {
    return joi.object().keys({
        force: joi.boolean(),
        url: joi.string().required(),
        agent: joi.string(),
        headers: joi.string(),
        delay: joi.number().integer().min(0),
        format: joi.string().lowercase().allow(OUTPUT_FORMATS),
        quality: joi.number().min(0).max(1),
        width: joi.number().integer().min(1),
        height: joi.number().integer().min(1),
        clipRect: joi.string().regex(REGEXP_CLIP_RECT),
        zoom: joi.number().min(0),
        js: joi.boolean(),
        images: joi.boolean(),
        user: joi.string(),
        password: joi.string()
    });
}


/* Functions to parse options */

function parseClipRect(cr) {
    var params = (cr || '').match(REGEXP_CLIP_RECT);
    if (params && (params.length === 5)) {
        return {
            top: parseInt(params[1]),
            left: parseInt(params[2]),
            width: parseInt(params[3]),
            height: parseInt(params[4])
        };
    }
    return null;
}

function parseUrl(url) {
    return decodeURI(url);
}

function parseHeaders(headers) {
    var res = qs.parse(headers, {
        delimiter: ';'
    });
    return _.isEmpty(res) ? null : res;
}


/* Options reader */

function readOptions(data, schema) {
    var keys = _.keys(schema.describe().children),
        options = _.pick(data, keys);

    options.url = parseUrl(options.url);
    options.headers = parseHeaders(options.headers);
    options.clipRect = parseClipRect(options.clipRect);

    return _.pick(options, _.identity);
}


/* Controller */

function enableCORS(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Expose-Headers", "Content-Type");
}

function index(config) {
    return function (req, res) {
        var schema = createSchema(),
            data = utils.validate(req.data, schema);

        if (data.error) {
            return res.json(data.error.details);
        }

        var options = readOptions(data.value, schema);
        return capture.screenshot(options, config, function (file) {
            if (config.cors) {
                enableCORS(res);
            }
            return res.sendFile(file);
        });
    };
}


/* Exported functions */

module.exports = {
    index: index
};
