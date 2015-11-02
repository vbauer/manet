"use strict";

var _ = require('lodash'),
    passport = require('passport'),
    passportHttp = require('passport-http'),
    utils = require('./utils');


/* Internal API */

function getBasic(conf) {
    let security = conf.security;
    return security ? security.basic : null;
}


/* Filters */

function merge(req, res, next) {
    let query = req.query || {},
        body = req.body || {};

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
    let creds = getBasic(conf);
    return creds ? passport.authenticate('basic', { session: false }) : null;
}

function configureWebSecurity(conf) {
    let creds = getBasic(conf);
    if (creds) {
        passport.use(new passportHttp.BasicStrategy((username, password, done) => {
            let correct = creds.username === username && creds.password === password;
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
