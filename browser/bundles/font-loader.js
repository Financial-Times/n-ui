import oTypography from 'o-typography';
import perfMark from 'n-ui-foundations/js/perf-mark';

new oTypography(document.documentElement)
	.loadFonts()
	.then(() => perfMark('fontsLoaded'));
