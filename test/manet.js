'use strict';

const _ = require('lodash'),
      assert = require('assert'),
      http = require('http'),
      querystring = require('querystring'),
      config = require('../src/config'),
      manet = require('../src/manet');


describe('manet', function () {

    process.env.cleanupStartup = true;
    process.env.silent = true;

    const conf = config.read();

    // Configure timeout = 2 min.
    this.timeout(120000);


    /* Common functions */

    function sendRequest(method, url, encoding, callback) {
        const options = {
            host: conf.host.replace('0.0.0.0', '127.0.0.1'),
            port: conf.port,
            method: method,
            path: url
        };

        http.request(options, (res) => {
            let data = '';

            res.setEncoding(encoding);
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => callback(data, res));
        }).end();
    }

    function checkResponse(res, data, type) {
        assert.equal(true, data.length > 0);
        assert.equal(type, res.headers['content-type'].toLowerCase());
        assert.equal(200, res.statusCode);
    }

    function checkApiCall(q, ct) {
        const params = _.defaults(q || {}, { url: 'google.com' }),
              apiUrl = '/?' + querystring.stringify(params),
              contentType = ct || 'image/png',
              dataType = 'binary';

        return (callback) =>
            sendRequest('GET', apiUrl, dataType, (d1, r1) => {
                checkResponse(r1, d1, contentType);
                sendRequest('POST', apiUrl, dataType, (d2, r2) => {
                    checkResponse(r2, d2, contentType);
                    callback();
                });
            });
    }


    /* Chain of responsibility */

    it('smoke testing of server', (done) => {
        manet.main((server) => {
            assert.notEqual(null, server);

            let checkSandboxUI = (callback) =>
                sendRequest('GET', '/', 'utf8', function (d1, r1) {
                    checkResponse(r1, d1, 'text/html; charset=utf-8');
                    callback();
                }),
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
                    format: 'jpg'
                }, 'image/jpeg'),
                checkHtmlFormat = checkApiCall({
                    format: 'html'
                }, 'text/html; charset=utf-8'),
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
                    images: false
                }),
                checkSelector = checkApiCall({
                    selector: "div"
                }),
                stopServer = () => server.close(done),

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
                    checkHtmlFormat,
                    checkDelay,
                    checkAgent,
                    checkJs,
                    checkImages,
                    checkSelector,
                    stopServer
                ],
                chainIndex = 0,
                chainHandler = () => {
                    if (chainIndex < chain.length) {
                        var callback = chain[chainIndex++];
                        callback(chainHandler);
                    }
                };

            chainHandler();
        });
    });

});
