'use strict';

function silentLogger() {
    process.env.silent = true;
}


/* Export functions */

module.exports = {
    silentLogger: silentLogger
};
