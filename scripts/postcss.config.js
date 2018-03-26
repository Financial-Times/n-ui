module.exports = {
	map: false,
	plugins: [
		require('postcss-discard-duplicates')(),
		require('autoprefixer')({
			browsers: '> 1%, last 2 versions, ie >= 9, ff ESR, bb >= 7, iOS >= 5',
			grid: true
		}),
		require('postcss-extract-css-block')()
	]
}
