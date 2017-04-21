const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

module.exports = () => {
	const hashes = fs.readdirSync(path.join(process.cwd(), 'public'))
		.filter(asset => !/(\.map|about\.json|asset-hashes\.json)$/.test(asset))
		.map(name => {
			const file = fs.readFileSync(path.join(process.cwd(), 'public', name), 'utf8');
			const hash = crypto.createHash('sha1').update(file).digest('hex');
			const hashedName = `${hash.substring(0, 8)}/${name}`;
			return { name, hashedName };
		})
		.reduce((previous, current) => {
			previous[current.name] = current.hashedName;
			previous[current.name + '.map'] = current.hashedName + '.map';
			return previous;
		}, {});
	fs.writeFileSync('./public/asset-hashes.json', JSON.stringify(hashes, null, 2), { encoding: 'UTF8' });
}
