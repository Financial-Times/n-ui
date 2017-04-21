const sharedQueryConfig = {
	enhanced: {
		features: [
			'default',
			'requestAnimationFrame',
			'Promise',
			'matchMedia',
			'HTMLPictureElement',
			'fetch',
			'Array.prototype.find',
			'Array.prototype.findIndex',
			'Array.prototype.includes',
			'IntersectionObserver',
			'Map',
			'Array.from',
			'NodeList.prototype.@@iterator',
			'Array.prototype.@@iterator'
		],
		flags: 'gated'
	},
	core: {
		features: [
			'HTMLPictureElement|always|gated'
		]
	}
}

const callbackName = 'ftNextPolyfillServiceCallback';

function buildQueryString (configName) {
	const qs = [];

	const qsConfig = sharedQueryConfig[configName];

	if (configName === 'enhanced') {
		qsConfig.callback = callbackName;
	}

	Object.keys(qsConfig).forEach(key => {
		const val = qsConfig[key];
		qs.push(`${key}=${Array.isArray(val) ? val.join(',') : val}`)
	})

	qs.push('source=next', 'unknown=polyfill')

	return `?${qs.join('&')}`;
}

const queryStrings = Object.keys(sharedQueryConfig)
	.reduce((configsMap, configName) => {
		configsMap[configName] = buildQueryString(configName)
		return configsMap;
	}, {})

module.exports = {
	callbackName,
	getQueryString: setting => queryStrings[setting]
}
