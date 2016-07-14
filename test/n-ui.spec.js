/*global require,describe,afterEach,beforeEach,it,expect*/
window.nextFeatureFlags = [{name: 'aFlag', state: true}];
const nUi = require('../main');
const jsSetup = require('../js-setup');
const entry = require('../_entry');
// import { presets } from '../js-setup/js/component-initializer';

describe('n-ui', () => {

	it('should export jsSetup methods', () => {
		expect(nUi.bootstrap).to.equal(jsSetup.bootstrap);
		expect(nUi.configure).to.equal(jsSetup.configure);
	});

	// Ideally this hould read the list from presets complete, but there's a hangover from the old flags client which
	// causes weird test failures :()
	// Array.from(new Set(Object.keys(presets.complete).filter(key => !!presets.complete[key]).concat([
	['header', 'footer', 'date', 'cookieMessage', 'welcomeMessage', 'myft', 'messagePrompts', 'promoMessages', 'ads']
	.concat([
		'tracking',
		'utils',
		'ftdomdelegate',
		'superstore',
		'superstoreSync',
		'React',
		'ReactDom',
		'notification',
		'expander',
		'grid',
		'overlay',
		'viewport',
	])
	// ])))
		.forEach(mod => {
			it(`should export _${mod}`, () => {
				expect(nUi['_' + mod]).to.exist;
			})
		})

	describe('_entry', () => {
		const aliases = entry();

		Object.keys(aliases).filter(alias => alias !== 'n-ui').forEach(alias => {
			it('should provide entry points for ' + alias, () => {
				expect(nUi[aliases[alias].replace('window.ftNextUi.', '')]).to.exist;
			})
		})

		describe('aliasing origami components', () => {
			Object.keys(aliases)
				.forEach(alias => {

					if (/^n-ui\//.test(alias)) {
						const oAlias = alias.replace(/^n-ui\//, 'o-');
						if (aliases[oAlias]) {
							it(`should provide ${oAlias} equivalent to ${alias}`, () => {
								expect(aliases[alias]).to.equal(aliases[oAlias]);
							})
						} else {
							it(`should not expect a ${oAlias} equivalent to ${alias}`, () => {
								expect(nUi[aliases[alias].replace('window.ftNextUi.', '')].__wrapsOrigami).to.not.be.true;
							});
						}
					} else if (/^o-/.test(alias)) {
						it(`should expect a ${alias} to be aliased`, () => {
							expect(nUi[aliases[alias].replace('window.ftNextUi.', '')].__wrapsOrigami).to.be.true;
						});
					}
				})
		});
		describe('preact', () => {
			it('should not provide preact entry point by default', () => {
				expect(aliases.react).not.to.exist;
				expect(nUi[aliases.react]).not.to.exist;
			})

			it('should provide preact entry point on demand', () => {
				const aliases = entry(true);
				expect(aliases.react).to.exist;
				expect(nUi[aliases.react.replace('window.ftNextUi.', '')]).to.exist;
				expect(aliases['react-dom']).to.exist;
				expect(nUi[aliases['react-dom'].replace('window.ftNextUi.', '')]).to.exist;
			})
		})

	})

})
