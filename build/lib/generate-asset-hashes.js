const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

module.exports = (directory = 'public', withBrotli) => {
	const hashes = fs.readdirSync(path.join(process.cwd(), directory))
		// don't hash the jsons or variants that are based on the original file contents (sourcemaps and brotlified assets)
		.filter(name => !/(\.map|\.br|about\.json|asset-hashes\.json)$/.test(name))
		// don't try to hash subdirectories, e.g. /n-ui/
		.filter(name => fs.statSync(path.join(process.cwd(), directory, name)).isFile())
		.map(name => {
			const file = fs.readFileSync(path.join(process.cwd(), directory, name), 'utf8');
			const hash = crypto.createHash('sha1').update(file).digest('hex');
			const hashedName = `${hash.substring(0, 8)}/${name}`;
			return { name, hashedName };
		})
		.reduce((previous, current) => {
			previous[current.name] = current.hashedName;
			const isCssFile = path.extname(current.name) === '.css';
			if (!isCssFile) {
				previous[current.name + '.map'] = current.hashedName + '.map';
			}
			if (withBrotli) {
				previous[current.name + '.br'] = current.hashedName + '.br';
			}
			return previous;
		}, {});
	fs.writeFileSync(`./${directory}/asset-hashes.json`, JSON.stringify(hashes, null, 2), { encoding: 'UTF8' });
};
