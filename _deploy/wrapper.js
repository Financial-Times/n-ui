window.ftNextUi = require('n-ui')

import {entryPoints} from './entry';

for (var key in entryPoints) {
	// take account of the fact we list some methods of n-ui in entry.js, for build purposes,
	// but they are in fact defined in main.js
	if (entryPoints[key]) {
		window.ftNextUi[key] = entryPoints[key];
	}
}
