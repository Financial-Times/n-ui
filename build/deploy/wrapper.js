/*global ftNextFireCondition*/
const nUi = require('../../browser/js/main');

nUi.bootstrap(window.ftNextUiConfig || {
	preset: 'discrete',
	preload: true
});

window.ftNextUi = nUi

ftNextFireCondition('nUiLoaded');
