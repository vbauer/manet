'use strict';

var _ = require('lodash'),
    assert = require('assert'),
    config = require('../src/config');


process.env.silent = true;
process.env.engine = 'phantomjs';


describe('config', function () {

    describe('read', function () {

        it('default configuration should exist', function () {
            var conf = config.read();
            assert.equal(false, _.isEmpty(conf));

            // Parameters are configured in "default.json" file.
            assert.equal('0.0.0.0', conf.host);
            assert.equal('phantomjs', conf.engine);
            assert.equal('info', conf.level);
            assert.equal(true, conf.ui);
            assert.equal(false, conf.cors);
            assert.equal(false, conf.compress);
            assert.equal(60000, conf.timeout);
            assert.equal(3600, conf.cache);
            assert.equal(8891, conf.port);
            assert.equal(false, _.isEmpty(conf.commands));
            assert.equal(false, _.isEmpty(conf.commands.phantomjs));
            assert.equal(false, _.isEmpty(conf.commands.slimerjs));
            assert.equal(false, _.isEmpty(conf.whitelist));

            // Parameters are configured in tests.
            assert.equal(true, conf.cleanup);
            assert.equal(true, conf.silent);
        });

    });

});
