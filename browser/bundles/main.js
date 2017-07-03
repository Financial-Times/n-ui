const nUi = require('../js/main');

nUi.bootstrap(window.ftNextUiConfig || {
	preset: 'discrete',
	preload: true
});

window.ftNextUi = nUi;
