
"use strict";

var _ = require('lodash'),
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
        logger.debug('Execution time: ' + procEnd);
        onClose();
    });
}


/* Export functions */

module.exports = {
    filePath: filePath,
    execProcess: execProcess
};
