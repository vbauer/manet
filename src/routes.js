"use strict";

var _ = require('lodash'),
    qs = require('qs'),
    fs = require('fs-extra'),
    joi = require('joi'),
    util = require('util'),
    logger = require('winston'),
    request = require('request'),
    UrlPattern = require('url-pattern'),
    capture = require('./capture'),
    utils = require('./utils');

const OUTPUT_FORMATS = ['jpg', 'jpeg', 'png', 'pdf', 'gif'],
      ENGINE_TYPES = ['phantomjs', 'slimerjs'],
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
        engine: joi.string().lowercase().trim().allow(ENGINE_TYPES),
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
    let params = (cr || '').match(REGEXP_CLIP_RECT);
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
    let res = qs.parse(headers, {
        delimiter: ';'
    });
    return _.isEmpty(res) ? null : res;
}


/* Options reader */

function readOptions(data, schema) {
    let keys = _.keys(schema.describe().children),
        options = _.pick(data, keys);

    options.url = parseUrl(options.url);
    options.headers = parseHeaders(options.headers);
    options.clipRect = parseClipRect(options.clipRect);

    return _.pick(options, _.identity);
}


/* Utility functions */

function enableCORS(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Type');
}

function message(text) { return { message: text }; }
function error(text) { return { error: text }; }
function badCapturing() { return error('Can not capture site screenshot'); }

function sendError(res, err) {
    let msg = err.message || err;
    logger.error(msg);
    try {
        res.status(500).json(error(msg));
    } catch (err) {}
    res.end();
}

function isUrlAllowed(config, url) {
    let whiteList = config.whitelist || [];
    return _.some(whiteList, (urlPattern) => new UrlPattern(urlPattern).match(url));
}


/* Result processors */

function onImageFileSent(file, config) {
    if (config.cleanupRuntime) {
        fs.unlink(file, () => logger.debug('Deleted file: %s', file));
    }
}

function sendImageInResponse(res, config) {
    return (file, error) => {
        if (error) {
            sendError(res, badCapturing());
        } else {
            if (config.cors) {
                enableCORS(res);
            }
            res.sendFile(file, (err) => {
                if (err) {
                    sendError(res, 'Error while sending image file: ' + err.message);
                }
                onImageFileSent(file, config);
            });
        }
    };
}

function sendImageToUrl(res, config, options) {
    return (file, error) => {
        let callbackUrl = utils.fixUrl(options.callback);
        if (error) {
            request.post(callbackUrl, error(badCapturing()));
        } else {
            let fileStream = fs.createReadStream(file);

            fileStream.on('error', (err) =>
                sendError(res, 'Error while reading image file: ' + err.message));

            fileStream.pipe(request.post(callbackUrl, (err) => {
                if (err) {
                    sendError(res, 'Error while streaming image file: ' + err.message);
                }
                onImageFileSent(file, config);
            }));
        }
    };
}


/* Controller */

function index(config) {
    return (req, res) => {
        let schema = createSchema(),
            data = utils.validate(req.data, schema);

        if (data.error) {
            res.json(error(data.error.details));
        } else {
            let options = readOptions(data.value, schema),
                siteUrl = options.url;

            if (!isUrlAllowed(config, siteUrl)) {
                sendError(res, util.format('URL "%s" is not allowed', siteUrl));
            } else {
                let callbackUrl = options.callback;
                if (callbackUrl) {
                    res.json(message(util.format(
                        'Screenshot will be sent to "%s" when processed', callbackUrl
                    )));

                    logger.debug(
                        'Streaming image (\"%s\") to \"%s\"', siteUrl, callbackUrl
                    );

                    capture.screenshot(
                        options, config, sendImageToUrl(res, config, options)
                    );
                } else {
                    logger.debug('Sending image (\"%s\") in response', siteUrl);
                    capture.screenshot(options, config, sendImageInResponse(res, config));
                }
            }

        }
    };
}


/* Exported functions */

module.exports = {
    index: index
};
