
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
			// alwyas pending https://github.com/Financial-Times/polyfill-service/pull/1041
			'Array.prototype.includes|always|gated',
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

const queryStrings = ['enhanced', 'core']
	.reduce((configsMap, configName) => {
		configsMap[configName] = buildQueryString(configName)
		return configsMap;
	}, {})

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


module.exports = {
	callbackName,
	getQueryString: opts => queryStrings[optsToString(opts)],
	getAllQueryStrings: () => queryStrings
}
