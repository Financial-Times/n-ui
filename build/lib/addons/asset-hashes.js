const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

function AssetHashes () {

	return function () {
		this.plugin('done', stats => {
			const hashable = Object.keys(stats.compilation.assets)
				.filter(asset => !/\.map$/.test(asset))
				.map(fullPath => {
					const name = path.basename(fullPath);
					const file = fs.readFileSync(fullPath, 'utf8');
					const hash = crypto.createHash('sha1').update(file).digest('hex');
					const hashedName = `${hash.substring(0, 8)}/${name}`;

					return { name, hashedName };
				})
				.reduce((previous, current) => {
					previous[current.name] = current.hashedName;
					previous[current.name + '.map'] = current.hashedName + '.map';
					return previous;
				}, {});
			const existingHashes = fs.existsSync('./public/asset-hashes.json') ? JSON.parse(fs.readFileSync('./public/asset-hashes.json')) : {};
			const hashes = Object.assign(existingHashes, hashable);
			fs.writeFileSync('./public/asset-hashes.json', JSON.stringify(hashes, null, 2), { encoding: 'UTF8' });
		});
	};
}

module.exports = AssetHashes;
