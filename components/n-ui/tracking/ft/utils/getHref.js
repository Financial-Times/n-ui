const getHref = function (el, path) {

	if (!el.parentNode) {
		return path;
	}

	const URL = window.URL || window.webkitURL;
	const href = el.getAttribute('href');

	if(!href){
		return getHref(el.parentNode, path);
	}

	if(URL){
		return new URL(href, location.href).href;
	}else{
		const a = document.createElement('a');
		a.href = href;
		if(a.href.startsWith('http')){
			return a.href;
		}else{
			return `${a.protocol}//${a.host}${a.pathname}`;
		}
	}
};

module.exports = getHref;
