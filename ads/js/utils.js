/*istanbul ignore next*/
function debounce (func, wait, immediate) {
	let timeout;
	return function () {
		const context = this;
		const args = arguments;
		const later = function () {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		const callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) {
			func.apply(context, args);
		}
	};
};

function getAppName () {
	const element = document.querySelector('[data-next-app]');
	if (element) {
		return element.getAttribute('data-next-app');
	}
	return 'unknown';
}


function getLayoutName () {
	const element = document.querySelector('[data-ads-layout]');
	if (element) {
		return element.getAttribute('data-ads-layout');
	}

	return 'default';
}

function getMetaData (name) {
	const meta = document.querySelector('meta[name="'+name+'"]');
	if (meta) {
		return meta.getAttribute('content');
	}
	return false;
}

function keyValueString (obj) {
	return Object.keys(obj).map(function (key) {
		return key + '=' + obj[key];
	}).join(';');
}

function getReferrer () {
	return document.referrer;
}

function isEmpty (htmlNode) {
	return htmlNode.firstChild === null || htmlNode.firstChild.nodeType !== 1 || htmlNode.firstChild.style.display === 'none';
}

function log () {
	let type;
	let args;
	let argsIndex;
	if ('log warn error info'.indexOf(arguments[0]) === -1) {
		type = 'log';
		argsIndex = 0;
	} else {
		type = arguments[0];
		argsIndex = 1;
	}

	args = [].slice.call(arguments, argsIndex);

	if (!log.isOn() || !window.console || !window.console[type]) {
		return;
	}

	window.console[type].apply(window.console, args);
}

log.warn = function () {
	const args = ['warn'].concat([].slice.call(arguments, 0));
	log.apply(null, args);
};

log.error = function () {
	const args = ['error'].concat([].slice.call(arguments, 0));
	log.apply(null, args);
};

log.info = function () {
	const args = ['info'].concat([].slice.call(arguments, 0));
	log.apply(null, args);
};

log.start = function () {
	if(!log.isOn() || !window.console || !window.console.groupCollapsed){
		return;
	}

	window.console.groupCollapsed('next-ads-component');
};

log.end = function () {
	if (!log.isOn() || !window.console || !window.console.groupEnd) {
		return;
	}

	window.console.groupEnd();
};

log.isOn = function () {
	return location.search.indexOf('DEBUG=ADS') > -1;
};

module.exports = {
	debounce: debounce,
	getAppName: getAppName,
	getLayoutName: getLayoutName,
	getMetaData: getMetaData,
	getReferrer: getReferrer,
	keyValueString: keyValueString,
	isEmpty: isEmpty,
	log: log
};
