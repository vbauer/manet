'use strict';

var assert = require('assert'),
    os = require('os'),
    utils = require('../src/utils');


describe('utils', function () {

    process.env.silent = true;

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

    describe('filePath', function () {

        it('not null', function () {
            var file = utils.filePath('.');
            assert.notEqual(null, file);
            assert.notEqual('', file);
        });

    });

    describe('runFsWatchdog', function () {

        it('should not start fs watch dog', function () {
            assert.equal(null, utils.runFsWatchdog(null, 0, null));
            assert.equal(null, utils.runFsWatchdog(null, 60, null));
            assert.equal(null, utils.runFsWatchdog('/tmp', 0, null));
        });

        it('should start fs watch dog correctly', function () {
            var watchdog = utils.runFsWatchdog(os.tmpdir(), 1, function() {});
            assert.notEqual(null, watchdog);
            clearInterval(watchdog);
        });

    });


    describe('execProcess', function () {

        it('should not execute empty command', function () {
            assert.throws(function () {
                utils.execProcess(null, null, function() {});
            });
            assert.throws(function () {
                utils.execProcess(null, [], function() {});
            });
            assert.throws(function () {
                utils.execProcess('', null, function() {});
            });
            assert.throws(function () {
                utils.execProcess('', [], function() {});
            });
        });

        it('execute "ls"', function () {
            utils.execProcess('ls', null, function(code) {
                assert.equal(0, code);
            });
            utils.execProcess('ls', [], function(code) {
                assert.equal(0, code);
            });
        });

        it('execute "ls -la"', function () {
            utils.execProcess('ls', ['-la'], function(code) {
                assert.equal(0, code);
            });
        });

        it('execute "ls -l -a"', function () {
            utils.execProcess('ls', ['-l', '-a'], function(code) {
                assert.equal(0, code);
            });
        });

    });

});
