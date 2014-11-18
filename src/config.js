"use strict";

var _ = require('lodash'),
    nconf = require('nconf'),
    logger = require('winston'),
    joi = require('joi'),
    path = require('path'),
    os = require('os'),
    utils = require('./utils'),

    DEF_CONFIG = 'config/default.json';


/* Functions to work with application configuration */

function createSchema() {
    return joi.object().keys({
        cache: joi.number().integer().min(1).label('Cache'),
        port: joi.number().integer().min(1).max(65535).label('Port number'),
        ui: joi.boolean().label('Sandbox UI'),
        silent: joi.boolean().label('Silent mode'),
        engine: joi.string().lowercase().allow('phantomjs', 'slimerjs').label('Engine'),
        command: joi.string().label('Command'),
        storage: joi.string().label('Storage path')
    });
}

function load() {
    var config = nconf.argv()
        .env()
        .file({
            file: utils.filePath(DEF_CONFIG)
        })
        .get();

    config.storage = path.resolve(config.storage || os.tmpdir());

    return config;
}

function read() {
    var conf = load(),
        val = utils.validate(conf, createSchema);

    if (val.error) {
        _.forEach(val.error.details, function(detail) {
            logger.error(detail.message);
        });
        process.exit(1);
    }
    return val.value;
}


/* Exported functions */

module.exports = {
    createSchema: createSchema,
    read: read
};
