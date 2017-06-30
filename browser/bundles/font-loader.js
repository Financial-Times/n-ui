(function(){

	const loadFonts = require('n-ui-foundations/typography/font-loader').loadFonts;

	function init () {
		loadFonts(document.documentElement);
	};

	window.ftNextPolyfillLoaded ? init() : document.addEventListener('ftNextPolyfillLoaded', init);
}());
