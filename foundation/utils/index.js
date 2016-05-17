'use strict';

module.exports = {
	$: function (sel, ctx) { return (ctx || document).querySelector(sel) },
	$$: function (sel, ctx) { return [].slice.call((ctx || document).querySelectorAll(sel))}
};
