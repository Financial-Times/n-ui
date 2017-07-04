console.log('nui start')
const nUi = require('../js/main');

nUi.bootstrap(window.ftNextUiConfig || {
	preset: 'discrete',
	preload: true
});

window.ftNextUi = nUi;
console.log('nui end')
