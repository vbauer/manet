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
        port: joi
            .number()
            .integer()
            .min(1)
            .max(65535)
            .label('Webserver port number'),
        cors: joi
            .boolean()
            .label('Enable CORS'),
        ui: joi
            .boolean()
            .label('Enable sandbox UI'),
        silent: joi
            .boolean()
            .label('Enable silent mode'),
        level: joi
            .string()
            .lowercase()
            .allow('silly', 'debug', 'verbose', 'info', 'warn', 'error')
            .label('Logging level'),
        engine: joi
            .string()
            .lowercase()
            .allow('phantomjs', 'slimerjs')
            .label('Engine name'),
        timeout: joi
            .number()
            .integer()
            .min(1)
            .label('Timeout'),
        statuscodes: joi
            .array()
            .default([])
            .label('Blacklist certain HTTP status response codes, defaults to allowing all status codes from server,'),
        options: joi
            .object()
            .default({})
            .label('Engine default options'),
        command: joi
            .string()
            .label('Command to run screenshot capturing'),
        storage: joi
            .string()
            .label('Storage path'),
        cache: joi
            .number()
            .integer()
            .min(1)
            .label('Cache life time'),
        cleanup: joi
            .boolean()
            .label('Cleanup storage at startup'),
        whitelist: joi
            .array()
            .default([])
            .label('List of allowed sites (RegExps)')
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
    var val = utils.validate(load(), createSchema());

    if (val.error) {
        _.forEach(val.error.details, function (detail) {
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
