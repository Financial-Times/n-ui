const path = require('path');
const fs = require('fs');

const expectedBuiltFiles = require('./expected-built-files');

async function expectedAssets () {
	return expectedBuiltFiles
		.map(filename => {
			if(!fs.existsSync(path.join(process.cwd(), 'public/n-ui', filename))) {
				throw new Error(`${filename} has not been built`);
			}
			return `./public/n-ui/${filename}`;
		});
}

const generateAssetHashes = require('../lib/generate-asset-hashes');

expectedAssets()
	.then(() => generateAssetHashes('public/n-ui'))
	.then(() => process.exit(0))
	.catch(err => {
		console.log(err) //eslint-disable-line
		process.exit(2);
	});
