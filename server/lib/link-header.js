module.exports = function linkHeaderFactory (hashedAssets) {
	return function (file, meta, opts) {
		meta = meta || {};
		opts = opts || {};
		const header = [];
		header.push(`<${opts.hashed ? hashedAssets.get(file) : file }>`);
		Object.keys(meta).forEach(key => {
			header.push(`${key}="${meta[key]}"`)
		});

		if (!meta.rel) {
			header.push('rel="preload"')
		}

		header.push('nopush');
		this.append('Link', header.join('; '))
	}
}
