'use strict';

var assert = require('assert'),
    common = require('./common'),
    manet = require('../src/manet');


describe('manet', function () {

    common.silentLogger();

    describe('config', function () {

        it('default configuration should exist', function () {
            var config = manet.readConfiguration();

            assert.notEqual(null, config);
            assert.notEqual(null, config.command);

            assert.equal('true', config.silent);
            assert.equal(3600, config.cache);
            assert.equal(8891, config.port);
        });

    });

    describe('main', function () {

        it('server should start correctly', function () {
            manet.main(function (server) {
                assert.notEqual(null, server);
                server.close();
            });
        });

    });

});
