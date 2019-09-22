
(function () { // jshint ignore:line
"use strict";

    /* Modules & Constants */

    var system = require('system'),
        webpage = require('webpage'),
        fs = require('fs');

    var DEF_ZOOM = 1,
        DEF_QUALITY = 1,
        DEF_DELAY = 100,
        DEF_WIDTH = 1024,
        DEF_HEIGHT = 768,
        DEF_PAPER_FORMAT= 'letter',
        DEF_PAPER_ORIENTATION = 'portrait',
        DEF_JS_ENABLED = true,
        DEF_IMAGES_ENABLED = true,
        DEF_FORMAT = 'png',
        DEF_HEADERS = {},
        DEF_STYLES = 'body { background: #fff; }';


    /* Common functions */

    function isPhantomJs() {
        return console && console.log;
    }

    function argument(index) {
        var delta = isPhantomJs() ? 1 : 0;
        return system.args[index + delta];
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

    function composeOptions(base64, outputFile) {
        try {
            var options = parseOptions(base64);
            options.outputFile = outputFile;
            return options;
        } catch (e) {
            exit(null, e);
        }
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
            userAgent: options.agent,
            XSSAuditingEnabled: false,
            webSecurityEnabled: false
        };
    }

    function pageClipRect(options) {
        var cr = options.clipRect;
        return (cr && cr.top >= 0 && cr.left >= 0 && cr.width && cr.height) ? cr : null;
    }

    function pageQuality(options, format) {
        // XXX: Quality parameter doesn't work for PNG files.
        if (format !== 'png') {
            var quality = def(options.quality, DEF_QUALITY);
            return isPhantomJs() ? String(quality * 100) : quality;
        }
        return null;
    }

    function pageCookies(options) {
        return options.cookies || [];
    }

    function paperSize(options) {
        return {
            format: options.paperFormat || DEF_PAPER_FORMAT,
            orientation: options.paperOrientation || DEF_PAPER_ORIENTATION,
            margin: '0px'
        };
    }

    function createPage(options, captureCallback) {
        var page = webpage.create(),
            clipRect = pageClipRect(options),
            cookies = pageCookies(options);

        cookies.forEach(function(cookie) {
            log('Use cookie: ' + JSON.stringify(cookie));
            phantom.addCookie(cookie);
        });

        page.zoomFactor = def(options.zoom, DEF_ZOOM);
        page.customHeaders = def(options.headers, DEF_HEADERS);
        page.viewportSize = pageViewPortSize(options);
        page.paperSize = paperSize(options);
        page.settings = pageSettings(options);
        if (clipRect) {
            page.clipRect = clipRect;
        }

        page.onResourceReceived = function(response) {
            if (response.stage === 'end') {
                log('Resource was downloaded: ' + response.url);
            }
        };

        page.onError = function(msg, trace) {
            log('ERROR: ' + msg);
            if (trace && trace.length) {
                log('TRACE:');
                trace.forEach(function(t) {
                    var f = t.file,
                        l = t.line,
                        fun = t.function ? ' (in function "' + t.function +'")' : '';
                    log(' -> ' + f + ': ' + l + fun);
                });
            }
        };

        page.onConsoleMessage = function(msg, line, source) {
            log('CONSOLE: ' + msg + ' (from line #' + line + ' in "' + source + '")');
        };

        page.onNavigationRequested = function(url, type, willNavigate, main) {
            var prevUrl = options.url;
            if (main && url !== prevUrl) {
                options.url = url;
                setTimeout(function() {
                    captureCallback(options);
                });
            }
        };

        return page;
    }


    /* Screenshot rendering */

    function addStyles(page, styles) {
        page.evaluate(function(styles) {
            var style = document.createElement('style'),
                content = document.createTextNode(styles),
                head = document.head;

            style.setAttribute('type', 'text/css');
            style.appendChild(content);

            head.insertBefore(style, head.firstChild);
        }, styles);
    }

    function renderScreenshotFile(page, options) {
        var delay = def(options.delay, DEF_DELAY),
            format = def(options.format, DEF_FORMAT),
            quality = pageQuality(options, format);

        setTimeout(function () {
            try {
                var outputFile = options.outputFile;

                if (format === 'html') {
                    var content = page.content;

                    fs.write(outputFile, content, 'w');
                } else {
                    var renderOptions = {
                        onlyViewport: !!options.height,
                        quality: quality,
                        format: format
                    };

                    page.render(outputFile, renderOptions);
                }

                log('Captured file: ' + outputFile);
                exit(page);
            } catch (e) {
                exit(page, e);
            }
        }, delay);
    }

    function captureScreenshot(options) {
        try {
            var page = createPage(options, captureScreenshot);

            page.open(options.url, function (status) {
                var onPageReady = function() {
                    try {
                        addStyles(page, DEF_STYLES);
                        renderScreenshotFile(page, options);
                    } catch (e) {
                        exit(page, e);
                    }
                },

                cropSelectorElement = function(){
                    var cropRect = page.evaluate(function (selector) {
                        var pos = document.querySelector(selector).getBoundingClientRect();
                        return {
                            top:    pos.top,
                            left:   pos.left,
                            width:  pos.right  - pos.left,
                            height: pos.bottom - pos.top,
                        };
                    }, options.selector);

                    if (options.selectorCropPadding) {
                        cropRect.top    -= options.selectorCropPadding;
                        cropRect.left   -= options.selectorCropPadding;
                        cropRect.width  += 2*options.selectorCropPadding;
                        cropRect.height += 2*options.selectorCropPadding;
                    }

                    if (options.zoom) {
                        for(var index in cropRect) {
                            if (cropRect.hasOwnProperty(index)) {
                                cropRect[index] = cropRect[index]*options.zoom;
                            }
                        }
                    }

                    page.clipRect = cropRect;
                },
                checkDomElementAvailable = function() {
                    if (options.selector) {
                        var interval = setInterval(function () {
                            var element = page.evaluate(function (selector) {
                                return document.querySelector(selector);
                            }, options.selector);

                            if (element !== null && typeof element === 'object') {
                                if (options.selectorCrop) {
                                    cropSelectorElement();
                                }

                                onPageReady();
                                clearInterval(interval);
                            }
                        }, 250);
                    } else {
                        onPageReady();
                    }
                },
                checkReadyState = function() {
                    setTimeout(function () {
                        var readyState = page.evaluate(function () {
                            return document.readyState;
                        });

                        if (readyState === null || 'complete' === readyState) {
                            checkDomElementAvailable();
                        } else {
                            checkReadyState();
                        }
                    });
                };

                if (status !== 'success') {
                    exit();
                } else {
                    checkReadyState();
                }
            });
        } catch (e) {
            exit(null, e);
        }
    }


    /* Configuration reading */

    var base64 = argument(0),
        outputFile = argument(1),
        options = composeOptions(base64, outputFile);


    /* Fire starter */

    captureScreenshot(options);

})();
