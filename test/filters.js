'use strict';

var _ = require('lodash'),
    assert = require('assert'),
    filters = require('../src/filters');


describe('filters', function () {
    var URL = 'github.com',
        req = function (url, param) {
            var r = {};
            r[param || 'data'] = {
                url: url
            };
            return r;
        },
        res = function (value) {
            return {
                sendFile: function () {
                    return value;
                }
            };
        };

    describe('merge', function () {
        var next = function (req) {
            return function () {
                return req.data.url;
            };
        };

        it('should take url from body', function () {
            var r = req(URL, 'body');
            assert.equal(URL, filters.merge(r, res(), next(r)));
        });

        it('should take url from query', function () {
            var r = req(URL, 'query');
            assert.equal(URL, filters.merge(r, res(), next(r)));
        });

        it('should take from url query in priority', function () {
            var r = _.defaults(req(URL, 'query'), req(URL + URL, 'body'));
            assert.equal(URL, filters.merge(r, res(), next(r)));
        });

    });

    describe('usage', function () {
        var next = _.constant,
            usage = filters.usage({ ui: true });

        it('should depend on configuration', function () {
            assert.equal(true, null === filters.usage({}));
            assert.equal(false, null === filters.usage({ ui: true }));
        });

        it('should process url parameter', function () {
            assert.equal(true, usage(req(URL), res(false), next(true)));
        });

        it('should process next function', function () {
            assert.equal(true, usage(req(null), res(true), next(false)));
            assert.equal(true, usage(req(''), res(true), next(false)));
        });

    });

    describe('basic', function () {

        it('should depend on configuration', function () {
            assert.equal(true, null === filters.basic({}));
            assert.equal(false, null === filters.basic({ security: { basic: {} } }));
        });

    });

});
