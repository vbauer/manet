"use strict";

const _ = require('lodash'),
      passport = require('passport'),
      passportHttp = require('passport-http'),
      logger = require('winston'),
      utils = require('./utils');


/* Internal API */

function getBasic(conf) {
    const security = conf.security;
    return security ? security.basic : null;
}


/* Filters */

function merge(req, res, next) {
    const query = req.query || {},
          body = req.body || {};

    logger.debug('Request query parameters: %s', JSON.stringify(query));
    logger.debug('Request body parameters: %s', JSON.stringify(body));

    req.data = _.defaults(query, body);
    return next();
}

function usage(conf) {
    if (conf.ui) {
        return (req, res, next) =>
            !req.data.url ? res.sendFile(utils.filePath('../public/usage.html')) : next();
    }
    return null;
}

function basic(conf) {
    const creds = getBasic(conf);
    return creds ? passport.authenticate('basic', { session: false }) : null;
}

function configureWebSecurity(conf) {
    const creds = getBasic(conf);
    if (creds) {
        passport.use(new passportHttp.BasicStrategy((username, password, done) => {
            const name = creds.username,
                  passwd = creds.password,
                  correct = name === username && passwd === password;
            done(null, correct ? basic : false);
        }));
    }
}


/* Exported functions */

module.exports = {
    merge: merge,
    usage: usage,
    basic: basic,
    configureWebSecurity: configureWebSecurity
};
