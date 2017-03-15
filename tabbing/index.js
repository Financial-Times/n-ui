module.exports = {
	init: function (flags) {

		if (flags.get('a11yKeyboardFocus')) {
			const container = document.querySelector('.js');

			window.addEventListener('keyup', function (e) {
				const pressedTab = e.keyCode === 9;
				const hasHasTabbedClass = container.className.indexOf('has-tabbed') !== -1; // needed for older IE vs classList?

				// Don't activate focus style when tab pressed inside a form elements
				const activatesFocusStyle = !e.target.type;

				if (pressedTab && !hasHasTabbedClass && activatesFocusStyle) {
					container.className = container.className + ' has-tabbed';
				}
			});
		}
	}
};
