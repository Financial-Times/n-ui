import WordListener from 'word-listener';
import { createToggler } from 'n-ui-foundations';
import invertBody from './invert-body';

function init () {
	new WordListener({
		word: 'invert',
		callback: createToggler({ callback: invertBody })
	});
}

module.exports = { init };
