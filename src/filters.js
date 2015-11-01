"use strict";

var _ = require('lodash'),
    passport = require('passport'),
    passportHttp = require('passport-http'),
    utils = require('./utils');


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
        }
    }
    return null;
}

function getBasic(conf) {
    var security = conf.security;
    return security ? security.basic : null;
}

function basic(conf) {
    var basic = getBasic(conf);
    return basic ? passport.authenticate('basic', { session: false }) : null;
}

function configureWebSecurity(conf) {
    var basic = getBasic(conf);
    if (basic) {
        passport.use(new passportHttp.BasicStrategy(
            function(username, password, done) {
                if (basic.username === username && basic.password === password) {
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
