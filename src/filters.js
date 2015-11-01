"use strict";

var _ = require('lodash'),
    passport = require('passport'),
    passportHttp = require('passport-http'),
    utils = require('./utils');


/* Internal API */

function getBasic(conf) {
    var security = conf.security;
    return security ? security.basic : null;
}


/* Filters */

function merge(req, res, next) {
    var query = req.query || {},
        body = req.body || {};

    req.data = _.defaults(query, body);
    return next();
}

function usage(conf) {
    if (conf.ui) {
        return function(req, res, next) {
            if (!req.data.url) {
                return res.sendFile(utils.filePath('../public/usage.html'));
            }
            return next();
        };
    }
    return null;
}

function basic(conf) {
    var creds = getBasic(conf);
    return creds ? passport.authenticate('basic', { session: false }) : null;
}

function configureWebSecurity(conf) {
    var creds = getBasic(conf);
    if (creds) {
        passport.use(new passportHttp.BasicStrategy(
            function(username, password, done) {
                if (creds.username === username && creds.password === password) {
                    return done(null, basic);
                }
                return done(null, false);
            }
        ));
    }
}


/* Exported functions */

module.exports = {
    merge: merge,
    usage: usage,
    basic: basic,
    configureWebSecurity: configureWebSecurity
};
