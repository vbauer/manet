'use strict';

const assert = require('assert'),
      os = require('os'),
      utils = require('../src/utils');


describe('utils', function () {

    process.env.silent = true;

    // Configure timeout = 5 sec.
    this.timeout(5000);

    describe('fixUrl', () => {

        it('null-value', () =>
            assert.equal(null, utils.fixUrl(null))
        );

        it('HTTP scheme', () => {
            const URL = 'http://android-arsenal.com';
            assert.equal(URL, utils.fixUrl(URL));
        });

        it('HTTPS scheme', () => {
            const URL = 'https://android-arsenal.com';
            assert.equal(URL, utils.fixUrl(URL));
        });

    });

    describe('encodeBase64', () => {

        it('BASE64 for not empty JSON object', () => {
            assert.equal(
                'eyJmb3JjZSI6dHJ1ZX0=',
                utils.encodeBase64({
                    'force': true
                })
            );
        });

        it('BASE64 for empty JSON object', () =>
            assert.equal('e30=', utils.encodeBase64({}))
        );

        it('BASE64 for null-object', () =>
            assert.equal('bnVsbA==', utils.encodeBase64(null))
        );

        it('BASE64 for non-JSON object', () =>
            assert.equal('IlN0cmluZyI=', utils.encodeBase64('String'))
        );

    });

    describe('filePath', () => {

        it('not null', () => {
            const file = utils.filePath('.');
            assert.notEqual(null, file);
            assert.notEqual('', file);
        });

    });

    describe('runFsWatchdog', () => {

        it('should not start fs watch dog', () => {
            assert.equal(null, utils.runFsWatchdog(null, 0, null));
            assert.equal(null, utils.runFsWatchdog(null, 60, null));
            assert.equal(null, utils.runFsWatchdog('/tmp', 0, null));
        });

        it('should start fs watch dog correctly', () => {
            const watchdog = utils.runFsWatchdog(os.tmpdir(), 1, function () {});
            assert.notEqual(null, watchdog);
            clearInterval(watchdog);
        });

    });


    describe('execProcess', () => {

        it('should not execute empty command', (done) => {
            assert.throws(() => utils.execProcess(null, null));
            assert.throws(() => utils.execProcess(null, {}));
            done();
        });

        it('execute "ls"', (done) => {
            utils.execProcess(['ls'], null, (error1) => {
                assert.equal(null, error1);
                utils.execProcess(['ls'], {}, (error2) => {
                    assert.equal(null, error2);
                    done();
                });
            });
        });

        it('execute "ls -l"', (done) => {
            utils.execProcess(['ls', '-l'], null, (error) => {
                assert.equal(null, error);
                done();
            });
        });

        it('execute "ls -l -a"', (done) => {
            utils.execProcess(['ls', '-l', '-a'], null, (error) => {
                assert.equal(null, error);
                done();
            });
        });

    });

});
