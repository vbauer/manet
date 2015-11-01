'use strict';

var _ = require('lodash'),
    assert = require('assert'),
    filters = require('../src/filters');


describe('filters', function () {

    var URL = 'github.com';

    function req(url, param) {
        var r = {};
        r[param || 'data'] = {
            url: url
        };
        return r;
    }

    function res(value) {
        return {
            sendFile: function () {
                return value;
            }
        };
    }


    describe('merge', function () {

        function next(req) {
            return function () {
                return req.data.url;
            };
        }

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

        var next = function(value) {
            return function () {
                return value;
            };
        },
        usage = filters.usage({ ui: true });

        it('should process url parameter', function () {
            assert.equal(true, usage(req(URL), res(false), next(true)));
        });

        it('should process next function', function () {
            assert.equal(true, usage(req(null), res(true), next(false)));
            assert.equal(true, usage(req(''), res(true), next(false)));
        });

    });

});
