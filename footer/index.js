'use strict';

function init (flags) {
	if (flags.get('newFooter')) {
		require('o-footer').init();
	}
}

module.exports = { init };
