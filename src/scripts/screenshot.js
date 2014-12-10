
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
        DEF_HEADERS = {},

        URL_PREFIX_HTTP = 'http://',
        URL_PREFIX_HTTPS = 'https://';


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

    function exit(page, e) {
        if (e) {
            log('Error: ' + e);
        }
        if (page) {
            page.close();
        }
        phantom.exit();
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
                page.render(outputFile, {
                    onlyViewport: !!options.height,
                    quality: quality,
                    format: format
                });

                log('Rendered screenshot: ' + outputFile);
                onFinish(page);
            } catch (e) {
                onFinish(page, e);
            }
        }, delay);
    }

    function fixUrl(url) {
        var http = url.indexOf(URL_PREFIX_HTTP) >= 0,
            https = url.indexOf(URL_PREFIX_HTTPS) >= 0;

        return (http || https) ? url : (URL_PREFIX_HTTP + url);
    }

    function captureScreenshot(base64, outputFile, onFinish) {
        try {
            var options = parseOptions(base64),
                url = fixUrl(options.url),
                page = createPage(options);

            page.open(url, function () {
                try {
                    renderScreenshotFile(page, options, outputFile, onFinish);
                } catch (e) {
                    onFinish(page, e);
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
