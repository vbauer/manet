"use strict";

const _ = require('lodash'),
      fs = require('fs-extra'),
      util = require('util'),
      logger = require('winston'),
      request = require('request'),
      UrlPattern = require('url-pattern'),
      capture = require('./capture'),
      utils = require('./utils'),
      opt = require('./options');


/* Utility functions */

function enableCORS(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Type');
}

function message(text) { return { message: text }; }
function error(text) { return { error: text }; }
function badCapturing(err, url) { 
    return error('Can not capture: ' + url + ', cause: ' + err.message);
}

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
            sendError(res, badCapturing(err, options.url));
        } else {
            if (config.cors) {
                enableCORS(res);
            }
            res.sendFile(file, (err) => {
                if (err) {
                    sendError(res, 'Error while sending data file: ' + err.message);
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
            request.post(callbackUrl, error(badCapturing(err, options.url)));
        } else {
            fs.stat(file, function(err, stat) {
                if (err) {
                    request.post(callbackUrl,
                        error('Error while detecting file size: ' + err.message));
                } else {
                    const fileStream = fs.createReadStream(file),
                          headers = { 'Content-Length': stat.size };

                    fileStream.on('error', (err) =>
                        request.post(callbackUrl,
                            error('Error while reading file: ' + err.message)));

                    fileStream.pipe(request.post(
                        { url: callbackUrl, headers: headers },
                        (err) => {
                            if (err) {
                                request.post(callbackUrl,
                                    error('Error while streaming file: ' + err.message));
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
        const schema = opt.createSchema(),
              data = utils.validate(req.data, schema);

        if (data.error) {
            res.json(error(data.error.details));
        } else {
            const options = opt.readOptions(data.value, schema),
                  siteUrl = options.url;

            if (!isUrlAllowed(config, siteUrl)) {
                sendError(res, util.format('URL "%s" is not allowed', siteUrl));
            } else {
                const callbackUrl = options.callback;
                if (callbackUrl) {
                    res.json(message(util.format(
                        'Data file will be sent to "%s" when processed', callbackUrl
                        )));

                    logger.debug('Streaming (\"%s\") to \"%s\"', siteUrl, callbackUrl);

                    capture.screenshot(options, config, sendImageToUrl(res, config, options));
                } else {
                    logger.debug('Sending file (\"%s\") in response', siteUrl);
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
