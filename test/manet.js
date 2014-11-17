'use strict';

var assert = require('assert'),
    http = require('http'),
    common = require('./common'),
    manet = require('../src/manet');


describe('manet', function () {

    common.silentLogger();

    describe('config', function () {

        it('default configuration should exist', function () {
            var config = manet.readConfiguration();

            assert.notEqual(null, config);
            assert.notEqual(null, config.commands);
            assert.notEqual(null, config.commands.phantomjs);
            assert.notEqual(null, config.commands.slimerjs);

            assert.equal('slimerjs', config.engine);
            assert.equal('true', config.silent);
            assert.equal(3600, config.cache);
            assert.equal(8891, config.port);
        });

    });

    describe('main', function () {

        function sendRequest(config, url, callback) {
            var options = {
                host: 'localhost',
                port: config.port,
                method: 'GET',
                path: url
            };

            http.request(options, function (res) {
                res.setEncoding('utf8');
                res.on('data', callback);
            }).end();
        }

        it('server should start correctly', function () {
            manet.main(function (server) {
                assert.notEqual(null, server);

                // Check sandbox UI
                sendRequest(manet.readConfiguration(), '/', function(data) {
                    assert.equal(true, data.length > 0);
                    server.close();
                });
            });
        });

    });

});
