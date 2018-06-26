/* 
	n-ui webpack config
	ruleset for loading raw text
*/

module.exports = {
	module: {
		rules: [
			{
				test: /\.txt$/,
				loader: 'raw-loader'
			}
		]
	}
};
