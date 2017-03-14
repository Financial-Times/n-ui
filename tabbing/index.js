module.exports = {
	init: function (flags) {
		if (flags.get('tabe')) {
			window.addEventListener('a11yKeyboardFocus', function (e) {
				if (e.keyCode === 9) {
					// don't do this if element is an input
					// find element with js class in it, add has-tabbed class to it
				}
			});
		}
	}
};
