
(function() {
"use strict";

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
        page.zoomFactor = def(options.zoom, 1);
        page.viewportSize = {
            width: def(options.width, 800),
            height: def(options.height, 600)
        };
        page.settings = {
            javascriptEnabled: def(options.js, true),
            loadImages: def(options.images, true),
            userName: options.user,
            password: options.password,
            userAgent: options.agent
        };
        return page;
    }


    /* Screenshot rendering */

    function renderScreenshotFile(page, options, outputFile) {
        var delay = def(options.delay, 100),
            format = def(options.format, 'png'),
            quality = def(options.quality, 1);

        slimer.wait(delay);

        page.render(outputFile, {
            onlyViewport: true,
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
