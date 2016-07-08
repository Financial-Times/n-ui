const utils = require('../../utils');

function init () {
	// TODO: Change ID (subnav/template:2) to `o-breadcrumb`?
	const breadcrumb = document.getElementById('n-breadcrumb');

	if (breadcrumb === null) {
		return;
	}

	const wrapper = breadcrumb.querySelector('.o-header__subnav-wrap-inside');
	// TODO: Do we need `buttons` to be an Array or should we keep it as a Nodelist
	// and iterate below in a for loop
	const buttons = Array.from(breadcrumb.getElementsByTagName('button'));

	let scrollWidth;
	let clientWidth;

	function direction (button) {
		return button.className.match(/left|right/).pop();
	}

	function scrollable () {
		scrollWidth = wrapper.scrollWidth;
		clientWidth = wrapper.clientWidth;

		buttons.forEach(button => {
			if (direction(button) === 'left') {
				button.disabled = wrapper.scrollLeft === 0;
			} else {
				const remaining = scrollWidth - clientWidth - wrapper.scrollLeft;
				// Allow a little difference as scrollWidth is fast, not accurate.
				button.disabled = remaining <= 1;
			}
		});
	}

	function scroll (e) {
		let distance = 100;

		if (direction(e.currentTarget) === 'left') {
			distance = (wrapper.scrollLeft > distance ? distance : wrapper.scrollLeft) * -1;
		} else {
			const remaining = scrollWidth - clientWidth - wrapper.scrollLeft;
			distance = remaining > distance ? distance : remaining;
		}

		wrapper.scrollLeft = wrapper.scrollLeft + distance;

		scrollable();
	}

	wrapper.addEventListener('scroll', utils.throttle(scrollable, 100));
	window.addEventListener('oViewport.resize', scrollable);

	buttons.forEach(button => {
		button.onclick = scroll;
	});

	scrollable(breadcrumb);
}

module.exports = { init };
