"use strict";

var utils = require('./utils');


function usage(req, res, next) {
    if (!req.query.url) {
        return res.sendFile(utils.filePath('../public/usage.html'));
    } else {
        return next();
    }
}


/* Export functions */

module.exports = {
    usage: usage
}
