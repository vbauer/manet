
(function () {
"use strict";

    /* Constants */

    var DEF_ZOOM = 1,
        DEF_QUALITY = 1,
        DEF_DELAY = 100,
        DEF_WIDTH = 1024,
        DEF_HEIGHT = 768,
        DEF_JS_ENABLED = true,
        DEF_IMAGES_ENABLED = true,
        DEF_FORMAT = 'png',
        DEF_HEADERS = {};


    /* Common functions */

    function isPhantomJs() {
        return console && console.log;
    }

    function argument(index) {
        return isPhantomJs() ? phantom.args[index] : system.args[index];
    }

    function log(message) {
        if (isPhantomJs()) {
            console.log(message);
        } else {
            system.stdout.write(message);
        }
    }

    function exit(page, e, invalid) {
        if (e) {
            log('Error: ' + e);
        }
        if (page) {
            page.close();
        }
        phantom.exit(invalid);
    }

    function def(o, d) {
        return ((o === null) || (typeof (o) === "undefined")) ? d : o;
    }

    function parseOptions(base64) {
        var optionsJSON = window.atob(base64);
        log('Script options: ' + optionsJSON);

        return JSON.parse(optionsJSON);
    }


    /* Web page creation */

    function pageViewPortSize(options) {
        return {
            width: def(options.width, DEF_WIDTH),
            height: def(options.height, DEF_HEIGHT)
        };
    }

    function pageSettings(options) {
        return {
            javascriptEnabled: def(options.js, DEF_JS_ENABLED),
            loadImages: def(options.images, DEF_IMAGES_ENABLED),
            userName: options.user,
            password: options.password,
            userAgent: options.agent
        };
    }

    function pageClipRect(options) {
        var cr = options.clipRect;
        return (cr && cr.top && cr.left && cr.width && cr.height) ? cr : null;
    }

    function pageQuality(options) {
        var quality = def(options.quality, DEF_QUALITY);
        return isPhantomJs() ? (quality * 100) : quality;
    }

    function createPage(options) {
        var page = webpage.create(),
            clipRect = pageClipRect(options);

        page.zoomFactor = def(options.zoom, DEF_ZOOM);
        page.customHeaders = def(options.headers, DEF_HEADERS);
        page.viewportSize = pageViewPortSize(options);
        page.settings = pageSettings(options);
        if (clipRect) {
            page.clipRect = clipRect;
        }

        return page;
    }


    /* Screenshot rendering */

    function renderScreenshotFile(page, options, outputFile, onFinish) {
        var delay = def(options.delay, DEF_DELAY),
            format = def(options.format, DEF_FORMAT),
            quality = pageQuality(options);

        setTimeout(function () {
            try {
                var renderOptions = {
                    onlyViewport: !!options.height,
                    quality: quality,
                    format: format
                };

                page.render(outputFile, renderOptions);

                log('Rendered screenshot: ' + outputFile);
                onFinish(page);
            } catch (e) {
                onFinish(page, e);
            }
        }, delay);
    }

    function captureScreenshot(base64, outputFile, onFinish) {
        try {
            var options = parseOptions(base64),
                page = createPage(options),
                isValidResponse = true,
                statusCode = 0;

            if (options.statusCodeBlacklist.length || options.statusCodeCeiling > 0) {
                // only add listener if we have status codes to check
                page.onResourceReceived = function (response) {
                    if (options.url === response.url) {
                        statusCode = parseInt(response.status);
                        if (options.statusCodeBlacklist.indexOf(statusCode) > -1) {
                            isValidResponse = false;
                        } else if (statusCode >= options.statusCodeCeiling) {
                            isValidResponse = false;
                        }
                    }
                };
            }
            page.open(options.url, function (e) {
                if(isValidResponse) {
                    try {
                        renderScreenshotFile(page, options, outputFile, onFinish);
                    } catch (e) {
                        onFinish(page, e);
                    }
                } else {
                    onFinish(page, false, statusCode);
                }
            });
        } catch (e) {
            onFinish(null, e);
        }
    }


    /* Fire starter */

    var system = require('system'),
        webpage = require('webpage'),
        base64 = argument(0),
        outputFile = argument(1);

    captureScreenshot(base64, outputFile, exit);

})();
