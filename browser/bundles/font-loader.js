// support for nodent-runtime and fast async
'use runtime-nodent';

import oTypography from 'o-typography';
const perfMark = require('n-ui-foundations/js/perf-mark');

new oTypography(document.documentElement)
	.loadFonts()
	.then(() => perfMark('fontsLoaded'));
