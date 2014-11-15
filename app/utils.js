
"use strict";

var _ = require('lodash'),
    path = require('path'),
    colors = require('colors/safe'),
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
        console.log('Output: %s', data);
    });
    proc.stderr.on('data', function (data) {
        console.log(colors.error('Error: %s'), data);
    });
    proc.on('close', function() {
        var procEnd = process.hrtime(procStart);
        console.log(colors.debug('Execution time: %s'), procEnd);
        onClose();
    });
}


/* Export functions */

module.exports = {
    filePath: filePath,
    execProcess: execProcess,
};
