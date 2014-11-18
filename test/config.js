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

            assert.equal('phantomjs', conf.engine);
            assert.equal('true', conf.silent);
            assert.equal(true, conf.ui);
            assert.equal(3600, conf.cache);
            assert.equal(8891, conf.port);
            assert.equal(false, _.isEmpty(conf));
            assert.equal(false, _.isEmpty(conf.commands));
            assert.equal(false, _.isEmpty(conf.commands.phantomjs));
            assert.equal(false, _.isEmpty(conf.commands.slimerjs));
        });

    });

});
