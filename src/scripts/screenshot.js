
(function() {
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

    function argument(index) {
        return phantom.args ? phantom.args[index] : system.args[index];
    }

    function log(message) {
        if (system.stdout) {
            system.stdout.write(message);
        } else {
            console.log(message);
        }
    }

    function exit(e) {
        if (e) {
            log('Error: ' + e);
        }
        phantom.exit();
    }

    function def(o, d) {
        return ((o === null) || (typeof(o) === "undefined")) ? d : o;
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

    function createPage(options) {
        var page = webpage.create();
        page.zoomFactor = def(options.zoom, DEF_ZOOM);
        page.customHeaders = def(options.headers, DEF_HEADERS);
        page.viewportSize = pageViewPortSize(options);
        page.settings = pageSettings(options);
        page.clipRect = pageClipRect(options);
        return page;
    }


    /* Screenshot rendering */

    function renderScreenshotFile(page, options, outputFile) {
        var delay = def(options.delay, DEF_DELAY),
            quality = def(options.quality, DEF_QUALITY),
            format = def(options.format, DEF_FORMAT);

        setTimeout(function() {
            try {
                page.render(outputFile, {
                    onlyViewport: !!options.height,
                    quality: quality,
                    format: format
                });

                log('Rendered screenshot: ' + outputFile);
            } catch (e) {
                exit(e);
            } finally {
                exit();
            }
        }, delay);
    }

    function fixUrl(url) {
        var http = !url.indexOf(URL_PREFIX_HTTP),
            https = !url.indexOf(URL_PREFIX_HTTPS);

        return (http || https) ? url : (URL_PREFIX_HTTP + url);
    }

    function captureScreenshot(base64, outputFile) {
        try {
            var options = parseOptions(base64),
                page = createPage(options),
                url = fixUrl(options.url);

            page.open(url, function () {
                try {
                    renderScreenshotFile(page, options, outputFile);
                } catch (e) {
                    exit(e);
                }
            });
        } catch (e) {
            exit(e);
        }
    }


    /* Fire starter */

    var system = require('system'),
        webpage = require('webpage'),
        base64 = argument(0),
        outputFile = argument(1);

    captureScreenshot(base64, outputFile);

})();
