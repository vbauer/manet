"use strict";

var _ = require('lodash'),
    qs = require('qs'),
    fs = require('fs-extra'),
    joi = require('joi'),
    util = require('util'),
    logger = require('winston'),
    request = require('request'),
    capture = require('./capture'),
    utils = require('./utils'),

    OUTPUT_FORMATS = ['jpg', 'jpeg', 'png', 'pdf', 'gif'],
    REGEXP_CLIP_RECT = /^(\d*),(\d*),([1-9]\d*),([1-9]\d*)$/;


/* Schemas */

function createSchema() {
    return joi.object().keys({
        force: joi.boolean(),
        url: joi.string().trim().required(),
        agent: joi.string().trim(),
        headers: joi.string().trim(),
        delay: joi.number().integer().min(0),
        format: joi.string().lowercase().trim().allow(OUTPUT_FORMATS),
        quality: joi.number().min(0).max(1),
        width: joi.number().integer().min(1),
        height: joi.number().integer().min(1),
        clipRect: joi.string().trim().regex(REGEXP_CLIP_RECT),
        zoom: joi.number().min(0),
        js: joi.boolean(),
        images: joi.boolean(),
        user: joi.string().trim(),
        password: joi.string().trim(),
        callback: joi.string().trim()
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
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Type');
}

function message(text) { return { message: text }; }
function error(text) { return { error: text }; }

function isUrlAllowed(config, url) {
    var whitelist = config.whitelist || [];

    return _.some(whitelist, function(regexp) {
        return url.match(regexp);
    });
}


function index(config) {
    return function (req, res) {
        var schema = createSchema(),
            data = utils.validate(req.data, schema);

        if (data.error) {
            res.json(error(data.error.details));
        } else {
            var options = readOptions(data.value, schema),
                siteUrl = options.url;

            if (!isUrlAllowed(config, siteUrl)) {
                res.json(error('URL is not allowed'));
            } else {
                var badCapturing = 'Can not capture site screenshot',
                    callbackUrl = options.callback,
                    sendImageInResponse = function (file, code) {
                        if (!code) {
                            if (config.cors) {
                                enableCORS(res);
                            }
                            res.sendFile(file, function(err) {
                                if (err) {
                                    logger.error('Error while sending file: %s', err.message);
                                    res.status(err.status).end();
                                }
                            });
                        } else {
                            res.json(error(badCapturing));
                        }
                    },
                    sendImageToUrl = function (file, code) {
                        if (!code) {
                            var fileStream = fs.createReadStream(file);
                            fileStream.on('error', function(err) {
                                logger.error('Error while reading file: %s', err.message);
                            });
                            fileStream.pipe(request.post(callbackUrl, function(err) {
                                if (err) {
                                    logger.error('Error while streaming file: %s', err.message);
                                }
                            }));
                        } else {
                            request.post(callbackUrl, error(badCapturing));
                        }
                    };

                if (callbackUrl) {
                    res.json(message(util.format(
                        'Screenshot will be sent to "%s" when processed', callbackUrl
                    )));

                    logger.debug('Streaming image (\"%s\") to \"%s\"', siteUrl, callbackUrl);
                    capture.screenshot(options, config, sendImageToUrl);
                } else {
                    logger.debug('Sending image (\"%s\") in response', siteUrl);
                    capture.screenshot(options, config, sendImageInResponse);
                }
            }

        }
    };
}


/* Exported functions */

module.exports = {
    index: index
};
