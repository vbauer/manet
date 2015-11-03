'use strict';

const _ = require('lodash'),
      assert = require('assert'),
      config = require('../src/config');


describe('config', () => {

    process.env.silent = true;
    process.env.engine = 'phantomjs';

    describe('read', () => {

        it('default configuration should exist', () => {
            const conf = config.read();
            assert.equal(false, _.isEmpty(conf));

            // Parameters are configured in "default.yaml" file.
            assert.equal('0.0.0.0', conf.host);
            assert.equal('phantomjs', conf.engine);
            assert.equal('info', conf.level);
            assert.equal(true, conf.ui);
            assert.equal(false, conf.cors);
            assert.equal(false, conf.compress);
            assert.equal(false, conf.cleanupRuntime);
            assert.equal(60000, conf.timeout);
            assert.equal(3600, conf.cache);
            assert.equal(8891, conf.port);
            assert.equal(false, _.isEmpty(conf.commands));
            assert.equal(false, _.isEmpty(conf.commands.phantomjs));
            assert.equal(false, _.isEmpty(conf.commands.slimerjs));
            assert.equal(false, _.isEmpty(conf.whitelist));

            // Parameters are configured in tests.
            assert.equal(true, conf.cleanupStartup);
            assert.equal(true, conf.silent);
        });

    });

});
