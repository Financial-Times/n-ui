/*global require,describe,afterEach,beforeEach,it,expect*/
window.nextFlags = [{name: 'aFlag', state: true}];
const nUi = require('../bundles/main');
const entry = require('../../build/webpack-externals');

describe('n-ui', () => {

	[
		'ads',
		'tracking',
		'flags',
		'appInfo',
		'allStylesLoaded',
		'onAppInitialized'
	]
		.forEach(mod => {
			it(`should export ${mod}`, () => {
				expect(nUi[mod]).to.exist;
			});
		});

	[
		'oDate',
		'ftdomdelegate',
		'superstore',
		'superstoreSync',
		'oGrid',
		'oViewport'
	]
		.forEach(mod => {
			it(`should export _hiddenComponents.${mod}`, () => {
				expect(nUi._hiddenComponents[mod]).to.exist;
			});
		});

	describe('_entry', () => {
		const aliases = entry();

		Object.keys(aliases).filter(alias => alias !== 'n-ui').forEach(alias => {
			it('should provide entry points for ' + alias, () => {
				expect(nUi[aliases[alias].replace('window.FT.nUi.', '')]).to.exist;
			});
		});
	});

});
