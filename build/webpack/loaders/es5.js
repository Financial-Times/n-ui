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
			]
		],
		presets: [
			[
				require.resolve('babel-preset-env'),
				{
					include: ['transform-es2015-classes'],
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
			// javascript and jsx
			{
				test: /\.jsx?$/,
				use: [babelLoaderConfig()]
			}
		]
	}
};
