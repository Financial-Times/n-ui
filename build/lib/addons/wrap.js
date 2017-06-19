// Slightly modified version of entry-wrap-webpack-plugin https://github.com/shakyShane/entry-wrap-webpack-plugin
const { ConcatSource } = require('webpack-sources');

function Wrap (before, after, options) {
	this.options = options || {};
	this.before = before;
	this.after = after;
}

Wrap.prototype.apply = function (compiler) {
	const options = this.options;
	const before = this.before;
	const after = this.after;

	compiler.plugin('compilation', function (compilation) {
		compilation.plugin('optimize-chunk-assets', function (chunks, callback) {
			chunks.forEach(function (chunk) {
				if(!chunk.isInitial()) return;
				const files = chunk.files.filter(file => options.match ? options.match.test(file) : true);
				files.forEach(function (file) {
					compilation.assets[file] = new ConcatSource(before, '\n', compilation.assets[file], '\n', after);
				});
			});
			callback();
		});
	});
};

module.exports = Wrap;
