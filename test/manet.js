'use strict';

var _ = require('lodash'),
    assert = require('assert'),
    http = require('http'),
    w3cjs = require('w3cjs'),
    config = require('../src/config'),
    manet = require('../src/manet');


process.env.silent = true;


describe('manet', function () {

    var conf = config.read(),
        DEF_HOSTNAME = 'localhost';

    this.timeout(15000);


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


    it('server should start correctly', function (done) {
        manet.main(function (server) {
            assert.notEqual(null, server);

            // Check sandbox UI
            sendRequest('GET', '/', 'utf8', function (d1, r1) {
                checkResponse(r1, d1, 'text/html; charset=utf-8');
                checkHtml(d1);

                // Check GET
                sendRequest('GET', '/?url=google.com', 'binary', function (d2, r2) {
                    checkResponse(r2, d2, 'image/png');

                    // Check POST
                    sendRequest('POST', '/?url=google.com', 'binary', function (d3, r3) {
                        checkResponse(r3, d3, 'image/png');
                        server.close();
                        done();
                    });
                });
            });
        });
    });

});
