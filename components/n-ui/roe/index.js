import WordListener from 'word-listener';
import { createToggler } from 'n-ui-foundations';
import bodyInversion from './body-inversion';
import rainbowize from './rainbow';

function init () {
	new WordListener({
		word: '\x69\x6e\x76\x65\x72\x74',
		callback: createToggler({ callback: bodyInversion })
	});
	new WordListener({
		word: '\x70\x72\x69\x64\x65',
		callback: createToggler({ callback: rainbowize })
	});
}

module.exports = { init };
