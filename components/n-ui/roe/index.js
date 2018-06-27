import WordListener from 'word-listener';
import { createToggler } from 'n-ui-foundations';
import bodyInversion from './body-inversion';

export function init () {
	new WordListener({
		word: '\x69\x6e\x76\x65\x72\x74',
		callback: createToggler({ callback: bodyInversion })
	});
}
