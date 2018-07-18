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
		plugins: [
			// transform commonjs to import/export syntax
			//'transform-commonjs-es2015-modules'
		],
		presets: [
			[
				'@babel/env',
				{
					// support ESM (es-modules)
					useBuiltIns: false,
					targets: {
						esmodules: true
					}
				}
			],
			'@babel/react',
		]
	}
});

module.exports = {
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
