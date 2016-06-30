/*global ftNextFireCondition*/
var nUi = require('n-ui');

nUi.configure(window.ftNextUiConfig || {
	preset: 'discrete'
});

// using `!== false` because while rolling it out it will be undefined in many apps
nUi.bootstrap(null, { preload: window.ftNextHasCustomJs !== false });

module.exports = nUi

// such a hack, but ensures this event fires after the above
// has been assigned to a global variable by webpack
setTimeout(function () {
	ftNextFireCondition('nUiLoaded');
}, 0);
