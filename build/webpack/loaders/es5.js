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
			[
				// use fast-async and nodent instead of Babel's regenerator
				// https://github.com/MatAtBread/fast-async
				// it's 3-4x faster in a browser (up to 10x on mobile)
				'fast-async',
				{
					// place nodent runtime in app shell bundles 
					// where 'use runtime-nodent'; is specified
					// if async/await is present
					'runtimePattern': 'directive'
				}
			],
			// converts `export default 'foo'` to `exports.default = 'foo'`
			require.resolve('babel-plugin-add-module-exports')
		],
		presets: [
			[
				require.resolve('babel-preset-env'),
				{
					include: ['transform-es2015-classes'],
					exclude: ['transform-regenerator', 'transform-async-to-generator'],
					targets: {
						browsers: ['last 2 versions', 'ie >= 11']
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
