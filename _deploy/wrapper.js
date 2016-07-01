/*global ftNextFireCondition*/
const nUi = require('n-ui');

nUi.configure(window.ftNextUiConfig || {
	preset: 'discrete'
});

nUi.bootstrap(null, { preload: true });

module.exports = nUi

// such a hack, but ensures this event fires after the above
// has been assigned to a global variable by webpack
setTimeout(function () {
	ftNextFireCondition('nUiLoaded');
}, 0);
