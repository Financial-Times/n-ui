/*global ftNextFireCondition*/
const nUi = require('../../browser/js/main');

nUi.bootstrap(window.ftNextUiConfig || {
	preset: 'discrete',
	preload: true
});

// such a hack, but ensures this event fires after the above
// has been assigned to a global variable by webpack
setTimeout(function () {
	ftNextFireCondition('nUiLoaded');
}, 0);

module.exports = nUi
