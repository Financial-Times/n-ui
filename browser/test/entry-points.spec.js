/*global require,describe,afterEach,beforeEach,it,expect*/
window.FT = {flags: [{name: 'aFlag', state: true}]};
import { AppInitializer } from '../js/app-initializer';
sinon.stub(AppInitializer.prototype, 'initializeComponents');
const nUi = require('../bundles/main');
const entry = require('../../build/webpack-externals');

describe('n-ui', () => {
	it('should initialize components', () => {
		expect(AppInitializer.prototype.initializeComponents.called).to.be.true;
	});

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
				expect(nUi._vendor[mod]).to.exist;
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
