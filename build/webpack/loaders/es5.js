/*
	n-ui webpack config
	ruleset for loading JavaScript
	and compile-to-JS scripts
	with Babel
*/

const babelLoaderConfig = () => ({
	loader: 'babel-loader',
	options: {
		babelrc: false, // ignore any .babelrc in project & dependencies
		cacheDirectory: true,
		plugins: [
			// converts `export default 'foo'` to `exports.default = 'foo'`
			require.resolve('babel-plugin-add-module-exports'),

			// ensures a module reqired multiple times is only transpiled once and
			// is shared by all that use it rather than transpiling it each time
			[
				require.resolve('babel-plugin-transform-runtime'),
				{
					helpers: false,
					polyfill: false
					// removes support for generators
					// async functions are handled through nodent / fast-async
					// regenerator: false
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
			// javascript
			{
				test: /^(?!.*\.(spec|test)\.js$).*\.js$/, // match JS but not tests
				use: [babelLoaderConfig()]
			}
		]
	}
};
