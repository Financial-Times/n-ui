/*
	n-ui webpack config
	ruleset for loading JavaScript
	and compile-to-JS scripts
	with Babel
*/

module.exports = opts => ({
	output: {
		filename: '[name].es6.js'
	},
	module: {
		rules: [
			// typescript
			{
				test: /\.ts$/,
				exclude: [/(node_modules|bower_components)/],
				use: [
					babelLoaderConfig(opts),
					{
						loader: 'ts-loader'
					}
				]
			},
			// javascript and jsx
			{
				test: /\.jsx?$/,
				use: [babelLoaderConfig(opts)]
			}
		]
	}
});

function babelLoaderConfig (opts) {
	return {
		loader: 'babel-loader',
		options: {
			// ignore any .babelrc in project & dependencies
			babelrc: false,
			cacheDirectory: true,
			plugins: [
				require.resolve('babel-plugin-transform-react-jsx'),
				{
					pragma: opts.pragma
				}
			],
			presets: [
				[
					require.resolve('babel-preset-env'),
					{
						// TODO: support ESM (es-modules)
						// after migrating to babel 7, which is currently in beta
						// use https://www.npmjs.com/package/babel-esm-plugin
						// modules: false,
						useBuiltIns: true,
						targets: {
							browsers: [
								'Chrome >= 60',
								'Safari >= 10.1',
								'iOS >= 10.3',
								'Firefox >= 54',
								'Edge >= 15'
							]
						}
					}
				]
			]
		}
	};
}
