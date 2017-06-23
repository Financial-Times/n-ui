const ratRace = require('promise-rat-race');
const nEagerFetch = require('n-eager-fetch');
const nUiManager = require('../../server/lib/asset-manager/n-ui-manager')
const logger = require('./logger');
const fs = require('fs');
const path = require('path');


const downloadAsset = (s3Name, localName) => {
	if (process.env.NEXT_APP_SHELL === 'local') {
		return Promise.resolve();
	}
	return ratRace(
		nUiManager.getReleaseRoots()
			.map(urlRoot =>
				nEagerFetch(`${urlRoot}${s3Name}`, {retry: 3})
					.then(res => {
						if (res.ok) {
							return res.text();
						}
						throw new Error('Failed to download ${s3Name} from s3');
					})
					.then(text => {
						// if it's an empty string, something probably went wrong
						if (!text.length) {
							throw new Error('Fetched empty ${s3Name} from s3');
						}
						return text;
					})
			)
	)
		.then(text => fs.writeFile(path.join(process.cwd(), `public/${localName || s3Name}`), text))
		.then(() => logger.success(`${s3Name} successfully retrieved from s3`))
		.catch(err => {
			logger.warn(`failed to fetch ${s3Name} from s3`)
			throw err;
		})
}


module.exports = () => {

	return Promise.all([
		downloadAsset('head-n-ui-core.css'),
		downloadAsset('asset-hashes.json', 'n-ui-asset-hashes.json'),
	])
		.catch(err => {
			if (!process.env.CIRCLE_BRANCH) {
				logger.info(`\
If developing locally and you are having network problems, your app
will be unable to download n-ui's assets. Try  \`export NEXT_APP_SHELL=local\`
to force them to be built locally.
`)
			}
			throw err;
		})
}
