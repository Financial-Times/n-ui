/*global require,describe,afterEach,beforeEach,it,expect*/
window.nextFlags = [{name: 'aFlag', state: true}];
const nUi = require('../js/main');
const entry = require('../../build/webpack-externals');

describe('n-ui', () => {

	it('should export jsSetup methods', () => {
		expect(nUi.bootstrap).to.be.a('function');
	});

	[
		'date',
		'ads',
		'tracking',
		'ftdomdelegate',
		'superstore',
		'superstoreSync',
		'React',
		'ReactDom',
		'grid',
		'viewport'
	]
		.forEach(mod => {
			it(`should export _${mod}`, () => {
				expect(nUi['_' + mod]).to.exist;
			});
		});

	describe('_entry', () => {
		const aliases = entry();

		Object.keys(aliases).filter(alias => alias !== 'n-ui').forEach(alias => {
			it('should provide entry points for ' + alias, () => {
				expect(nUi[aliases[alias].replace('window.ftNextUi.', '')]).to.exist;
			});
		});

		describe('aliasing origami components', () => {
			Object.keys(aliases)
				.forEach(alias => {
					if (/^n-ui\//.test(alias)) {
						const oAlias = alias.replace(/^n-ui\//, 'o-');
						if (aliases[oAlias]) {
							it(`should provide ${oAlias} equivalent to ${alias}`, () => {
								expect(aliases[alias]).to.equal(aliases[oAlias]);
							});
						} else {
							it(`should not expect a ${oAlias} equivalent to ${alias}`, () => {
								expect(nUi[aliases[alias].replace('window.ftNextUi.', '')].__wrapsOrigami).to.not.be.true;
							});
						}
					} else if (/^o-/.test(alias)) {
						it(`should expect a ${alias} to be aliased`, () => {
							expect(nUi[aliases[alias].replace('window.ftNextUi.', '')]).to.exist;
						});
					}
				});
		});
		describe('preact', () => {
			it('should provide preact entry point by default', () => {
				expect(aliases.react).to.exist;
				expect(nUi[aliases.react.replace('window.ftNextUi.', '')]).to.exist;
				expect(aliases['react-dom']).to.exist;
				expect(nUi[aliases['react-dom'].replace('window.ftNextUi.', '')]).to.exist;
			});
		});

	});

});
