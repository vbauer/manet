'use strict';

var _ = require('lodash'),
    assert = require('assert'),
    http = require('http'),
    manet = require('../src/manet');


process.env.silent = true;
process.env.engine = 'phantomjs';


describe('manet', function () {
        
    var config = manet.readConfiguration();
    
    describe('config', function () {

        it('default configuration should exist', function () {
            assert.equal('phantomjs', config.engine);
            assert.equal('true', config.silent);
            assert.equal(3600, config.cache);
            assert.equal(8891, config.port);            
            assert.equal(false, _.isEmpty(config));
            assert.equal(false, _.isEmpty(config.commands));
            assert.equal(false, _.isEmpty(config.commands.phantomjs));
            assert.equal(false, _.isEmpty(config.commands.slimerjs));
        });

    });

    describe('main', function () {

        function sendRequest(method, url, encoding, callback) {
            var options = {
                host: 'localhost',
                port: config.port,
                method: method,
                path: url
            };
            
            http.request(options, function (res) {
                var data = '';
                res.setEncoding(encoding);
                res.on('data', function(chunk) {
                    return data += chunk;
                });
                res.on('end', function() {
                    return callback(data);
                });                
            }).end();
        }

        it('server should start correctly', function () {
            manet.main(function (server) {
                assert.notEqual(null, server);

                // Check sandbox UI
                sendRequest('GET', '/', 'utf8', function(d1) {
                    assert.equal(true, d1.length > 0);
                    
                    // Check GET
                    sendRequest('GET', '/?url=google.com', 'binary', function(d2) {
                        assert.equal(true, d2.length > 0);
                        
                        // Check GET
                        sendRequest('POST', '/?url=google.com', 'binary', function(d2) {
                            assert.equal(true, d2.length > 0);
                            server.close();
                        });
                    });
                });
            });
        });

    });

});
