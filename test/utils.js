'use strict';

var _ = require('lodash'),
    assert = require('assert'),
    os = require('os'),
    common = require('./common'),
    utils = require('../src/utils');


describe('utils', function () {

    common.silentLogger();

    describe('lodash plugins', function () {

        it('check compactObject', function () {
            assert.deepEqual({}, _.compactObject());
            assert.deepEqual({}, _.compactObject({}));
            assert.deepEqual({}, _.compactObject({d: null}));
            assert.deepEqual({d: 't'}, _.compactObject({d: 't'}));
            assert.deepEqual({d: 't'}, _.compactObject({d: 't', e: ''}));
            assert.deepEqual({d: 't'}, _.compactObject({d: 't', e: null}));
            assert.deepEqual({d: 't'}, _.compactObject({d: 't', e: null}));
            assert.deepEqual({d: 't', e: 'f'}, _.compactObject({d: 't', e: 'f'}));
        });

        it('check filterByCollection', function () {
            assert.deepEqual({}, _.filterByCollection());
            assert.deepEqual({}, _.filterByCollection({}));
            assert.deepEqual({}, _.filterByCollection({}, []));
            assert.deepEqual({}, _.filterByCollection({}, ['d']));
            assert.deepEqual({}, _.filterByCollection({d: 't'}, ['e']));
            assert.deepEqual({d: 't'}, _.filterByCollection({d: 't'}, ['d']));
            assert.deepEqual({d: 't', e: 'f'}, _.filterByCollection({d: 't', e: 'f'}, ['d', 'e']));
        });

    });

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
