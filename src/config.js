"use strict";

const nconf = require('nconf'),
      yaml = require('js-yaml'),
      cloudEnv = require('cloud-env'),
      logger = require('winston'),
      joi = require('joi'),
      path = require('path'),
      os = require('os'),
      utils = require('./utils'),

      DEF_CONFIG = 'config/default.yaml',
      ENV_IP = 'IP',
      ENV_PORT = 'PORT';


/* Functions to work with application configuration */

function createSchema() {
    return joi.object().keys({
        host: joi
            .string()
            .label('Webserver host'),
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
            .valid('silly', 'debug', 'verbose', 'info', 'warn', 'error')
            .label('Logging level'),
        engine: joi
            .string()
            .lowercase()
            .valid('phantomjs', 'slimerjs')
            .label('Default engine'),
        timeout: joi
            .number()
            .integer()
            .min(1)
            .label('Timeout'),
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
            .label('Cache life time'),
        cleanupStartup: joi
            .boolean()
            .label('Cleanup storage at startup'),
        cleanupRuntime: joi
            .boolean()
            .label('Cleanup storage after sending image'),
        compress: joi
            .boolean()
            .label('Compress screenshots'),
        whitelist: joi
            .array()
            .default([])
            .label('List of allowed sites (RegExps)')
    });
}

function defaultConfigPath() {
    return utils.filePath(DEF_CONFIG);
}

function load() {
    const confPath = defaultConfigPath(),
          config = nconf.argv()
            .env()
            .file({
                file: confPath,
                format: {
                    parse: yaml.safeLoad,
                    stringify: yaml.safeDump,
                }
            })
            .get();

    config.cache = Math.max(config.cache, 0);
    config.storage = path.resolve(config.storage || os.tmpdir());
    config.host = config.host || cloudEnv.get(ENV_IP);
    config.port = config.port || cloudEnv.get(ENV_PORT);
    config.path = confPath;

    return config;
}

function read() {
    const val = utils.validate(load(), createSchema()),
          err = val.error;

    if (err) {
        err.details.forEach((detail) => logger.error(detail.message));
        process.exit(1);
    }
    return val.value;
}


/* Exported functions */

module.exports = {
    createSchema: createSchema,
    read: read
};
