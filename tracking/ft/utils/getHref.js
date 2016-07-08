const getHref = function (el, path) {

	if (!el.parentNode) {
		return path;
	}

	const href = el.getAttribute('href');

	if (href) {
		const a = document.createElement('a');
		a.href = href;
		return `${a.protocol}//${a.hostname}${a.pathname}`;
	}

	return getHref(el.parentNode, path);
};

module.exports = getHref;
