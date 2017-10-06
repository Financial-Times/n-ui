/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const denodeify = require('denodeify');
const compress = denodeify(require('iltorb').compress);
const readFile = denodeify(fs.readFile);
const writeFile = denodeify(fs.writeFile);

const read = dir => fs.readdirSync(dir).reduce((files, name) => {
	if (fs.statSync(path.join(dir, name)).isDirectory()) {
		return files.concat(read(path.join(dir, name)));
	} else {
		return files.concat({
			uncompressed: {dir, name},
			compressed: {dir: `${dir}/compressed/`, name: `${name}.br`}
		});
	}
}, []);

module.exports = assetPath => {
	const files = read(assetPath);
	return Promise.all(files.map(file => {
		if (!fs.existsSync(file.compressed.dir)) {
			fs.mkdirSync(file.compressed.dir);
		}
		return readFile(path.join(file.uncompressed.dir,file.uncompressed.name))
			.then(buffer => compress(buffer,{quality: 11}))
			.then(contents => {
				return writeFile(path.join(file.compressed.dir,file.compressed.name), contents)
					.then(() => path.join(file.compressed.dir,file.compressed.name))
					.catch(error => console.error(error));
			});
		}
	)).catch(error => console.error(error));
};
