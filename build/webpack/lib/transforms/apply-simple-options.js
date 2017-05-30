
module.exports = function (options, output) {
		output.output = options.output || {filename: '[name]'};

		if (options.entry) {
			output.entry = options.entry;
		}

		if (options.loaders) {
			output.module.loaders = output.module.loaders.concat(options.loaders);
		}
}
