'use strict';

var _ = require('lodash'),
    assert = require('assert'),
    http = require('http'),
    w3cjs = require('w3cjs'),
    querystring = require('querystring'),
    config = require('../src/config'),
    manet = require('../src/manet');


process.env.cleanup = true;
process.env.silent = true;


describe('manet', function () {

    var conf = config.read();

    // Configure timeout = 2 min.
    this.timeout(120000);


    /* Common functions */

    function sendRequest(method, url, encoding, callback) {
        var options = {
            host: conf.host,
            port: conf.port,
            method: method,
            path: url
        };

        http.request(options, function (res) {
            var data = '';

            res.setEncoding(encoding);
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                return callback(data, res);
            });
        }).end();
    }

    function checkHtml(html) {
        w3cjs.validate({
            input: html,
            callback: function (res) {
                assert.equal(true, _.isEmpty(res.messages));
            }
        });
    }

    function checkResponse(res, data, type) {
        assert.equal(true, data.length > 0);
        assert.equal(type, res.headers['content-type'].toLowerCase());
        assert.equal(200, res.statusCode);
    }

    function checkApiCall(q, ct) {
        var params = _.defaults(q || {}, {
                url: 'google.com'
            }),
            apiUrl = '/?' + querystring.stringify(params),
            contentType = ct || 'image/png',
            dataType = 'binary';

        return function (callback) {
            sendRequest('GET', apiUrl, dataType, function (d1, r1) {
                checkResponse(r1, d1, contentType);
                sendRequest('POST', apiUrl, dataType, function (d2, r2) {
                    checkResponse(r2, d2, contentType);
                    callback();
                });
            });
        };
    }


    /* Chain of responsibility */

    it('smoke testing of server', function (done) {
        manet.main(function (server) {
            assert.notEqual(null, server);

            var checkSandboxUI = function (callback) {
                    sendRequest('GET', '/', 'utf8', function (d1, r1) {
                        checkResponse(r1, d1, 'text/html; charset=utf-8');
                        checkHtml(d1);
                        callback();
                    });
                },
                checkUrl = checkApiCall(),
                checkCache = checkUrl,
                checkWidthAndHeight = checkApiCall({
                    width: 320,
                    height: 200
                }),
                checkClipRect = checkApiCall({
                    clipRect: '20,20,80,80'
                }),
                checkZoomIn = checkApiCall({
                    zoom: 2
                }),
                checkZoomOut = checkApiCall({
                    zoom: 2.0
                }),
                checkForce = checkApiCall({
                    force: true
                }),
                checkQualityAndFormat = checkApiCall({
                    quality: 0.5,
                    format: "jpg"
                }, 'image/jpeg'),
                checkDelay = checkApiCall({
                    delay: 100
                }),
                checkAgent = checkApiCall({
                    agent: 'Mozilla/5.0 (compatible, MSIE 11, ' +
                        'Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko'
                }),
                checkJs = checkApiCall({
                    js: false
                }),
                checkImages = checkApiCall({
                    js: false
                }),
                stopServer = function () {
                    server.close();
                    done();
                },

                chain = [
                    checkSandboxUI,
                    checkUrl,
                    checkCache,
                    checkWidthAndHeight,
                    checkClipRect,
                    checkZoomIn,
                    checkZoomOut,
                    checkForce,
                    checkQualityAndFormat,
                    checkDelay,
                    checkAgent,
                    checkJs,
                    checkImages,
                    stopServer
                ],
                chainIndex = 0,
                chainHandler = function () {
                    if (++chainIndex < chain.length) {
                        var callback = chain[chainIndex];
                        callback(chainHandler);
                    }
                };

            chainHandler();
        });
    });

});
