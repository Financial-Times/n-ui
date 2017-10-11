/*global require,describe,afterEach,beforeEach,it,expect,sinon*/
window.FT = {flags: [{name: 'aFlag', state: true}]};
import { AppInitializer } from '../js/app-initializer';

const entry = require('../../build/webpack-externals');

describe('n-ui bundle', () => {

	before(() => {
		sinon.stub(AppInitializer.prototype, 'initializeComponents');
		require('../bundles/main');
	});

	after(() => {
		AppInitializer.prototype.initializeComponents.restore();
	});

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
				expect(window.FT.nUi[mod]).to.exist;
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
				expect(window.FT.nUi._hiddenComponents[mod]).to.exist;
			});
		});

	describe('_entry', () => {
		const aliases = entry();

		const getProp = str => {
			const nest = str.split('.');
			nest.shift(); // ignore window
			let res = window;
			let prop;
			while(prop = nest.shift()) {
				res = res[prop];
			}
			return res;
		};

		Object.keys(aliases).filter(alias => alias !== 'n-ui').forEach(alias => {
			it('should provide entry point for ' + alias, () => {
				expect(getProp(aliases[alias])).to.exist;
			});
		});
	});

});
