"use strict";

var _ = require('lodash'),
    utils = require('./utils');


function usage(req, res, next) {
    req.data = _.defaults(req.query, req.body);

    if (!req.data.url) {
        return res.sendFile(utils.filePath('../public/usage.html'));
    } else {
        return next();
    }
}


/* Export functions */

module.exports = {
    usage: usage
};
