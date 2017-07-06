import oTypography from 'o-typography';
const perfMark = require('n-ui-foundations/js/perf-mark');

new oTypography(document.documentElement)
	.load()
	.then(() => perfMark('fontsLoaded'));
