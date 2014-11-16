
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
        DEF_FORMAT = 'png';


    /* Common functions */

    function error(e) {
        system.stdout.write('Error: ' + e);
        slimer.exit();
    }

    function def(o, d) {
        return ((o === null) || (typeof(o) === "undefined")) ? d : o;
    }

    function parseOptions(base64) {
        var optionsJSON = window.atob(base64);
        system.stdout.write('SlimerJS script options: ' + optionsJSON);

        return JSON.parse(optionsJSON);
    }


    /* Web page creation */

    function createPage(options) {
        var page = webpage.create();
        page.zoomFactor = def(options.zoom, DEF_ZOOM);
        page.viewportSize = {
            width: def(options.width, DEF_WIDTH),
            height: def(options.height, DEF_HEIGHT)
        };
        page.settings = {
            javascriptEnabled: def(options.js, DEF_JS_ENABLED),
            loadImages: def(options.images, DEF_IMAGES_ENABLED),
            userName: options.user,
            password: options.password,
            userAgent: options.agent
        };
        return page;
    }


    /* Screenshot rendering */

    function renderScreenshotFile(page, options, outputFile) {
        var delay = def(options.delay, DEF_DELAY),
            quality = def(options.quality, DEF_QUALITY),
            format = def(options.format, DEF_FORMAT).toLowerCase();

        slimer.wait(delay);

        page.render(outputFile, {
            onlyViewport: !!options.height,
            quality: quality,
            format: format
        });

        system.stdout.write('SlimerJS rendered screenshot: ' + outputFile);
    }


    function captureScreenshot(base64, outputFile) {
        try {
            var options = parseOptions(base64),
                page = createPage(options);

            page.open(options.url, function () {
                try {
                    renderScreenshotFile(page, options, outputFile);
                } catch (e) {
                    error(e);
                } finally {
                    slimer.exit();
                }
            });
        } catch (e) {
            error(e);
        }
    }


    /* Fire starter */

    var system = require('system'),
        webpage = require('webpage'),
        base64 = phantom.args[0],
        outputFile = phantom.args[1];

    captureScreenshot(base64, outputFile);

})();
