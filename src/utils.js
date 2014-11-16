
"use strict";

var _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    logger = require('winston'),
    childProcess = require('child_process');


/* Lo-Dash plugins */

_.mixin({
    compactObject: function (o) {
        var clone = _.clone(o);
        _.each(clone, function (v, k) {
            if (!v) {
                delete clone[k];
            }
        });
        return clone;
    }
});

_.mixin({
    filterByCollection: function (o, c) {
        var res = {};
        _.each(o, function (v, k) {
            if (_.contains(c, k)) {
                res[k] = v;
            }
        });
        return res;
    }
});


/* Functions to work with FS */

function filePath(file) {
    return path.normalize(path.join(__dirname, file));
}


function runFsWatchdog(dir, timeout, callback) {
    if (timeout > 0) {
        setInterval(function () {
            fs.readdir(dir, function (err, files) {
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
}


/* Functions to work with processes */

function execProcess(cmd, args, onClose) {
    var proc = childProcess.spawn(cmd, args),
        procStart = process.hrtime();

    proc.stdout.on('data', function (data) {
        logger.debug('Output: %s', data.toString());
    });
    proc.stderr.on('data', function (data) {
        logger.error('Error: %s', data.toString());
    });
    proc.on('close', function() {
        var procEnd = process.hrtime(procStart);
        var end = (procEnd[0] + procEnd[1] / 1e9).toFixed(2);
        logger.debug('Execution time: %d sec', end);
        onClose();
    });
}


/* Export functions */

module.exports = {
    filePath: filePath,
    execProcess: execProcess,
    runFsWatchdog: runFsWatchdog
};
