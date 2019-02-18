const polyfillRoot = 'https://www.ft.com/__origami/service/polyfill/v3/polyfill.min.js';
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
			'Array.prototype.@@iterator',
			'IntersectionObserver',
			'Map',
			'Set',
			'Array.from',
			'NodeList.prototype.forEach',
			'NodeList.prototype.@@iterator',
			'EventSource',
			'Number.isInteger',
			'Object.entries',
			'String.prototype.padStart',
			'String.prototype.padEnd'
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
