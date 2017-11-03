const polyfillRoot = 'https://www.ft.com/__origami/service/polyfill/v2/polyfill.min.js';
function buildQueryString (qsConfig) {
	const qs = [];

	Object.keys(qsConfig).forEach(key => {
		const val = qsConfig[key];
		qs.push(`${key}=${Array.isArray(val) ? val.join(',') : val}`);
	});

	qs.push('source=next', 'unknown=polyfill');

	return `?${qs.join('&')}`;
}

const queryStrings = {
	enhanced: buildQueryString({
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
			'Array.prototype.@@iterator',
			'EventSource'
		],
		flags: 'gated'
	}),
	core: buildQueryString({
		features: [
			'HTMLPictureElement|always|gated'
		]
	})
};

module.exports = {
	enhanced: polyfillRoot + queryStrings['enhanced'],
	core: polyfillRoot + queryStrings['core']
};
