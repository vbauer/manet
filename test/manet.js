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

    var conf = config.read(),
        DEF_HOSTNAME = 'localhost';

    // Configure timeout = 1 min.
    this.timeout(60000);


    /* Common functions */

    function sendRequest(method, url, encoding, callback) {
        var options = {
            host: DEF_HOSTNAME,
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

    function checkApiCall(q) {
        var params = _.defaults(q || {}, {
                url: 'google.com'
            }),
            apiUrl = '/?' + querystring.stringify(params),
            contentType = 'image/png',
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
                checkForce = checkApiCall({
                    force: true
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
                    checkForce,
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
