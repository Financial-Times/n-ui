/* jshint browser:true */
/* global module:true */

function click(el) {
	const evt = new Event('click');
	el.dispatchEvent(evt);
}

module.exports = {
	click: click
};
