import WordListener from 'word-listener';
import { createToggler } from 'n-ui-foundations';
import bodyInversion from './body-inversion';
import canIPleaseGetAPuppy from './can-i-please-get-a-puppy';

function init () {
	new WordListener({
		word: '\x69\x6e\x76\x65\x72\x74',
		callback: createToggler({ callback: bodyInversion })
	});

	new WordListener({
		word: 'puppy',
		callback: createToggler({ callback: canIPleaseGetAPuppy })
	});
}

module.exports = { init };
