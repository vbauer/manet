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

        it('should take url from body', function (done) {
            var r = req(URL, 'body');
            assert.equal(URL, filters.merge(r, res(), next(r)));
            done();
        });

        it('should take url from query', function (done) {
            var r = req(URL, 'query');
            assert.equal(URL, filters.merge(r, res(), next(r)));
            done();
        });

        it('should take from url query in priority', function (done) {
            var r = _.defaults(req(URL, 'query'), req(URL + URL, 'body'));
            assert.equal(URL, filters.merge(r, res(), next(r)));
            done();
        });

    });

    describe('usage', function () {

        function next(value) {
            return function () {
                return value;
            };
        }

        it('should process url parameter', function (done) {
            assert.equal(true, filters.usage(req(URL), res(false), next(true)));
            done();
        });

        it('should process next function', function (done) {
            assert.equal(true, filters.usage(req(null), res(true), next(false)));
            assert.equal(true, filters.usage(req(''), res(true), next(false)));
            done();
        });

    });

});
