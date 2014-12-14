"use strict";

var fs = require('fs-extra'),
    joi = require('joi'),
    path = require('path'),
    logger = require('winston'),
    exec = require('exec');


/* Validation */

function validate(object, schema) {
    return joi.validate(object, schema, {
        allowUnknown: true
    });
}


/* BASE64 functions */

function encodeBase64(json) {
    return new Buffer(JSON.stringify(json), 'binary').toString('base64');
}


/* Functions to work with FS */

function filePath(file, dir) {
    return path.normalize(path.join((dir || __dirname), file));
}

function runFsWatchdog(dir, timeout, callback) {
    if (dir && (timeout > 0)) {
        return setInterval(function () {
            fs.readdir(dir, function (err, files) {
                if (err) {
                    return logger.error(err);
                }

                files.forEach(function (file) {
                    var filePath = path.join(dir, file);
                    fs.stat(filePath, function (err, stat) {
                        var endTime, now;
                        if (err) {
                            return logger.error(err);
                        }
                        now = new Date().getTime();
                        endTime = new Date(stat.ctime).getTime() + timeout;
                        if (now > endTime) {
                            return callback(filePath);
                        }
                    });
                });
            });
        }, timeout);
    }
    return null;
}


/* Functions to work with processes */

function execProcess(command, options, onClose) {
    var procStart = process.hrtime(),
        opts = options || {};

    exec(command, opts, function(err, out, code) {
        logger.debug('Process output: %s', out);

        if (err) {
            logger.error('Process error: %s', err);
        } else {
            var procEnd = process.hrtime(procStart),
                end = (procEnd[0] + procEnd[1] / 1e9).toFixed(2);

            logger.debug('Execution time: %d sec', end);

            if (onClose) {
                onClose(code);
            }
        }
    });
}


/* Exported functions */

module.exports = {
    validate: validate,
    encodeBase64: encodeBase64,
    filePath: filePath,
    runFsWatchdog: runFsWatchdog,
    execProcess: execProcess
};
