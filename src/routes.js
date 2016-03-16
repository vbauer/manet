"use strict";

const _ = require('lodash'),
      qs = require('qs'),
      fs = require('fs-extra'),
      joi = require('joi'),
      util = require('util'),
      logger = require('winston'),
      request = require('request'),
      UrlPattern = require('url-pattern'),
      capture = require('./capture'),
      utils = require('./utils'),

      REGEXP_CLIP_RECT = /^(\d*),(\d*),([1-9]\d*),([1-9]\d*)$/;


/* Schemas */

function createSchema() {
    return joi.object().keys({
        force: joi.boolean(),
        url: joi.string().trim().required(),
        agent: joi.string().trim(),
        headers: joi.string().trim(),
        delay: joi.number().integer().min(0),
        format: joi.string().lowercase().trim().valid('jpg', 'jpeg', 'png', 'pdf', 'gif'),
        engine: joi.string().lowercase().trim().valid('phantomjs', 'slimerjs'),
        quality: joi.number().min(0).max(1),
        width: joi.number().integer().min(1),
        height: joi.number().integer().min(1),
        clipRect: joi.string().trim().regex(REGEXP_CLIP_RECT),
        zoom: joi.number().min(0),
        selector: joi.string().trim(),
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


/* Utility functions */

function enableCORS(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Type');
}

function message(text) { return { message: text }; }
function error(text) { return { error: text }; }
function badCapturing(url) { return error('Can not capture site screenshot: ' + url); }

function sendError(res, err) {
    const msg = err.message || err;
    logger.error(msg);
    try {
        res.status(500).json(error(msg));
    } catch (err) {}
    res.end();
}

function isUrlAllowed(config, url) {
    const whiteList = config.whitelist || [];
    return _.some(whiteList, (urlPattern) => new UrlPattern(urlPattern).match(url));
}


/* Result processors */

function onImageFileSent(file, config) {
    if (config.cleanupRuntime) {
        fs.unlink(file, () => logger.debug('Deleted file: %s', file));
    }
}

function sendImageInResponse(res, config, options) {
    return (file, err) => {
        if (err) {
            sendError(res, badCapturing(options.url));
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
    return (file, err) => {
        const callbackUrl = utils.fixUrl(options.callback);
        if (err) {
            request.post(callbackUrl, error(badCapturing(options.url)));
        } else {
            fs.stat(file, function(err, stat) {
                if (err) {
                    request.post(callbackUrl,
                        error('Error while detecting image file size: ' + err.message));
                } else {
                    const fileStream = fs.createReadStream(file),
                          headers = { 'Content-Length': stat.size };

                    fileStream.on('error', (err) =>
                        request.post(callbackUrl,
                            error('Error while reading image file: ' + err.message)));

                    fileStream.pipe(request.post(
                        { url: callbackUrl, headers: headers },
                        (err) => {
                            if (err) {
                                request.post(callbackUrl,
                                    error('Error while streaming image file: ' + err.message));
                            }
                            onImageFileSent(file, config);
                        }
                    ));
                }
            });             
        }
    };
}


/* Controller */

function index(config) {
    return (req, res) => {
        const schema = createSchema(),
              data = utils.validate(req.data, schema);

        if (data.error) {
            res.json(error(data.error.details));
        } else {
            const options = readOptions(data.value, schema),
                  siteUrl = options.url;

            if (!isUrlAllowed(config, siteUrl)) {
                sendError(res, util.format('URL "%s" is not allowed', siteUrl));
            } else {
                const callbackUrl = options.callback;
                if (callbackUrl) {
                    res.json(message(util.format(
                        'Screenshot will be sent to "%s" when processed', callbackUrl
                        )));

                    logger.debug('Streaming image (\"%s\") to \"%s\"', siteUrl, callbackUrl);

                    capture.screenshot(options, config, sendImageToUrl(res, config, options));
                } else {
                    logger.debug('Sending image (\"%s\") in response', siteUrl);
                    capture.screenshot(options, config, sendImageInResponse(res, config, options));
                }
            }

        }
    };
}


/* Exported functions */

module.exports = {
    index: index
};
