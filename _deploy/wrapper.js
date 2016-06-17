/*global ftNextFireCondition*/
module.exports = require('n-ui');

// such a hack, but ensures this event fires after the above
// has been assigned to a global variable by webpack
setTimeout(function () {
	ftNextFireCondition('nUiLoaded');
}, 0);
