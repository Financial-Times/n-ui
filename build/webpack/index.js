const clone = require('clone');

const transforms = [
	require('./lib/transforms/base'),
	require('./lib/transforms/apply-simple-options'),
	require('./lib/transforms/base-js'),
	require('./lib/transforms/base-scss'),
	require('./lib/transforms/babel'),
	require('./lib/transforms/build-env'),
	require('./lib/transforms/stats')
];

module.exports = (options) => {
	options = clone(options);
	options.ECMAScriptVersion = ('ECMAScriptVersion' in options) ? options.ECMAScriptVersion : 5;
	const output = {};
	transforms.forEach(transform => {
		transform(options, output);
	})
	output.resolve.alias = output.resolve.alias = Object.assign(output.resolve.alias || {}, {
		'react': 'preact-compat',
		'react-dom': 'preact-compat'
	});
	return output;
}
