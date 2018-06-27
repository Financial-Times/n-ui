/*
	n-ui webpack config
	ruleset for loading JavaScript
	and compile-to-JS scripts
	with Babel
*/

const babelLoaderConfig = () => ({
	loader: 'babel-loader',
	options: {
		// ignore any .babelrc in project & dependencies
		babelrc: false,
		cacheDirectory: true,
		presets: [
			[
				require.resolve('babel-preset-env'),
				{
					modules: false,
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
			],
			require.resolve('babel-preset-react')
		]
	}
});

module.exports = {
	module: {
		rules: [
			// typescript
			{
				test: /\.ts$/,
				exclude: [/(node_modules|bower_components)/],
				use: [
					babelLoaderConfig(),
					{
						loader: 'ts-loader'
					}
				]
			},
			// javascript
			{
				test: /\.js$/,
				use: [babelLoaderConfig()]
			}
		]
	}
};
