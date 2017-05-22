const callback = 'ftNextPolyfillServiceCallback';
const queryStringConfigs = {
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
		flags: 'gated',
		callback
	},
	core: {
		features: [
			'HTMLPictureElement|always|gated'
		]
	}
}

function buildQueryString (configName) {
	const qs = [];

	const qsConfig = queryStringConfigs[configName];

	Object.keys(qsConfig).forEach(key => {
		const val = qsConfig[key];
		qs.push(`${key}=${Array.isArray(val) ? val.join(',') : val}`)
	})

	qs.push('source=next', 'unknown=polyfill')

	return `?${qs.join('&')}`;
}

const queryStrings = Object.keys(queryStringConfigs)
	.reduce((configsMap, configName) => {
		configsMap[configName] = buildQueryString(configName)
		return configsMap;
	}, {})

module.exports = flags => {
	let polyfillRoot;
	/* istanbul ignore if */
	if (flags.polyfillQA) {
		polyfillRoot = 'https://qa.polyfill.io/v2/polyfill.min.js';
	} else {
		polyfillRoot = 'https://www.ft.com/__origami/service/polyfill/v2/polyfill.min.js';
	}

	return {
		callback,
		enhanced: polyfillRoot + queryStrings['enhanced'] + `&callback=${callback}`,
		core: polyfillRoot + queryStrings['core']
	}
}
