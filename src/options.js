"use strict";

const _ = require('lodash'),
      joi = require('joi'),
      qs = require('qs'),

      REGEXP_CLIP_RECT = /^(\d*),(\d*),([1-9]\d*),([1-9]\d*)$/;


/* Schemas */

function createSchema() {
    return joi.object().keys({
        force: joi.boolean(),
        url: joi.string().trim().required(),
        agent: joi.string().trim(),
        headers: joi.string().trim(),
        delay: joi.number().integer().min(0),
        format: joi.string().lowercase().trim().valid(
            'jpeg', 'jpg', 'png', 'html', 'bmp', 'pdf', 'ppm', 'ico'),
        engine: joi.string().lowercase().trim().valid(
            'phantomjs', 'slimerjs'),
        quality: joi.number().min(0).max(1),
        width: joi.number().integer().min(1),
        height: joi.number().integer().min(1),
        paperFormat: joi.string().trim().valid(
            'letter', 'A2', 'A3', 'A4', 'A5'),
        paperOrientation: joi.string().lowercase().trim().valid(
            'portrait', 'landscape'
        ),
        clipRect: joi.string().trim().regex(REGEXP_CLIP_RECT),
        zoom: joi.number().min(0),
        selector: joi.string().trim(),
        selectorCrop:joi.boolean(),
        selectorCropPadding:joi.number().integer(),
        js: joi.boolean(),
        images: joi.boolean(),
        user: joi.string().trim(),
        password: joi.string().trim(),
        callback: joi.string().trim(),
        cookies: joi.array().items(
            joi.object().keys({
                name: joi.string().required(),
                value: joi.string().required(),
                domain: joi.string(),
                path: joi.string().required(),
                httponly: joi.boolean(),
                secure: joi.boolean(),
                expires: joi.string()
            })
        )
    });
}


/* Functions to parse options */

function parseClipRect(cr) {
    const params = (cr || '').match(REGEXP_CLIP_RECT);
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
    const res = qs.parse(headers, {
        delimiter: ';'
    });
    return _.isEmpty(res) ? null : res;
}


/* Options reader */

function readOptions(data, schema) {
    const keys = _.keys(schema.describe().children),
          options = _.pick(data, keys);

    options.url = parseUrl(options.url);
    options.headers = parseHeaders(options.headers);
    options.clipRect = parseClipRect(options.clipRect);

    return _.omitBy(options, (v) => _.isUndefined(v) || _.isNull(v));
}


/* Exported functions */

module.exports = {
    createSchema: createSchema,
    readOptions: readOptions
};
