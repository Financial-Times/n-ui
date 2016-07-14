/*global require,describe,afterEach,beforeEach,it,expect*/
window.nextFeatureFlags = [{name: 'aFlag', state: true}];
const nUi = require('../main');

describe('n-ui', () => {

	describe('entry points', () => {
		['ads', 'tracking', 'date', 'header', 'promoMessages', 'cookieMessage', 'welcomeMessage', 'messagePrompts', 'myft', 'utils', 'ftdomdelegate', 'superstore', 'superstoreSync', 'React', 'ReactDom', 'notification', 'expander', 'grid', 'overlay', 'viewport', 'footer']
			.forEach(mod => {
				it(`should export _${mod}`, () => {
					expect(nUi['_' + mod]).to.exist;
				})
			})
	});

})
