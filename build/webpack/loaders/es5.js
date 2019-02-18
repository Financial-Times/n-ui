/*
	n-ui webpack config
	ruleset for loading JavaScript
	and compile-to-JS scripts
	with Babel
*/

module.exports = opts => {
	const loaderConfig = babelLoaderConfig(opts);
	return {
		module: {
			rules: [
				// typescript
				{
					test: /\.ts$/,
					exclude: [/(node_modules|bower_components)/],
					use: [
						loaderConfig,
						{
							loader: 'ts-loader'
						}
					]
				},
				// javascript and jsx
				{
					test: /\.jsx?$/,
					use: [loaderConfig]
				}
			]
		}
	};
};

function babelLoaderConfig (opts) {
	return {
		loader: 'babel-loader',
		options: {
			// ignore any .babelrc in project & dependencies
			babelrc: false,
			cacheDirectory: true,
			plugins: loaderPluginsConfig(opts),
			presets: [
				[
					require.resolve('babel-preset-env'),
					{
						include: ['transform-es2015-classes'],
						targets: {
							browsers: ['last 2 versions', 'ie >= 11']
						}
					}
				]
			]
		}
	};
}

function loaderPluginsConfig (opts) {
	const loaderPlugins = [
		// converts `export default 'foo'` to `exports.default = 'foo'`
		require.resolve('babel-plugin-add-module-exports'),
		// includes Babel's regenerator	runtime (once only)
		// for client-side async/await support
		[
			require.resolve('babel-plugin-transform-runtime'),
			{
				helpers: false,
				polyfill: false
			}
		],
		[
			require.resolve('babel-plugin-transform-react-jsx'),
			{
				pragma: opts.pragma
			}
		]
	];
	if(opts.karmaTest) {
		loaderPlugins.push(require.resolve('babel-plugin-rewire'));
	}
	return loaderPlugins;
}
