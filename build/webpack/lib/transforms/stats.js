const StatsWriterPlugin = require('webpack-stats-plugin').StatsWriterPlugin;

module.exports = function (options, output) {
		if (options.outputStats) {
			output.plugins.push(new StatsWriterPlugin({
				filename: options.outputStats,
				fields: null
			}));
		}
}
