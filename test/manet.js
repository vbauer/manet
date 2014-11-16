'use strict';

var assert = require('assert'),
    common = require('./common'),
    manet = require('../src/manet');


describe('manet', function () {

    describe('main', function () {
        common.silentLogger();

        it('server should start', function () {
            manet.main(function (server) {
                assert.notEqual(null, server);
                server.close();
            });
        });

    });

});
