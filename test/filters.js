'use strict';

var assert = require('assert'),
    filters = require('../src/filters');


describe('filters', function () {

    describe('usage', function () {

        function request(url) {
            return {
                query: {
                    url: url
                }
            };
        }

        function response(value) {
            return {
                sendFile: function () {
                    return value;
                }
            };
        }

        function next(value) {
            return function () {
                return value;
            };
        }


        it('should process url parameter', function () {
            assert.equal(true, filters.usage(request('github.com'), response(false), next(true)));
        });

        it('should process next function', function () {
            assert.equal(true, filters.usage(request(null), response(true), next(false)));
            assert.equal(true, filters.usage(request(''), response(true), next(false)));
        });

    });

});
