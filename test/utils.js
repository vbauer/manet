'use strict';

var assert = require('assert'),
    utils = require('../src/utils');


describe('utils', function () {

    describe('encodeBase64', function () {

        it('BASE64 for not empty JSON object', function () {
            assert.equal(
                'eyJmb3JjZSI6dHJ1ZX0=',
                utils.encodeBase64({
                    'force': true
                })
            );
        });

        it('BASE64 for empty JSON object', function () {
            assert.equal(
                'e30=',
                utils.encodeBase64({})
            );
        });

        it('BASE64 for null-object', function () {
            assert.equal(
                'bnVsbA==',
                utils.encodeBase64(null)
            );
        });

        it('BASE64 for non-JSON object', function () {
            assert.equal(
                'IlN0cmluZyI=',
                utils.encodeBase64('String')
            );
        });

    });

    describe('execProcess', function () {

        it('ls', function () {
            utils.execProcess('ls', null, function(code) {
                assert.equal(0, code);
            });
            utils.execProcess('ls', [], function(code) {
                assert.equal(0, code);
            });
        });

        it('ls -la', function () {
            utils.execProcess('ls', ['-la'], function(code) {
                assert.equal(0, code);
            });
        });

        it('ls -l -a', function () {
            utils.execProcess('ls', ['-l', '-a'], function(code) {
                assert.equal(0, code);
            });
        });

    });

});
