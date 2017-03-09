const ratRace = require('promise-rat-race');
const nEagerFetch = require('n-eager-fetch');
const nUiManager = require('../../server/lib/n-ui-manager')
const logger = require('./logger');
const fs = require('fs');
const path = require('path');

const downloadHeadCss = () => {
	if (process.env.LOCAL_APP_SHELL === 'local') {
		return Promise.resolve();
	}
	return ratRace(
		nUiManager.getReleaseRoots()
			.map(urlRoot =>
				nEagerFetch(`${urlRoot}head-n-ui-core.css`, {retry: 3})
					.then(res => {
						if (res.ok) {
							return res.text();
						}
						throw new Error('Failed to fetch n-ui stylesheet');
					})
					.then(text => {
						// if it's an empty string, something probably went wrong
						if (!text.length) {
							throw new Error('Fetched empty n-ui stylesheet');
						}
						return text;
					})
			)
	)
		.then(text => fs.writeFile(path.join(process.cwd(), 'public/head-n-ui-core.css'), text))
		.then(() => logger.success('head-n-ui-core.css successfully retrieved from s3'))
		.catch(err => {
			logger.warn('failed to fetch head-n-ui-core.css from s3')
			logger.warn(err)
		})
}

module.exports = () => {

	return downloadHeadCss()
		.then(() => {
			if (!fs.existsSync(path.join(process.cwd(), 'public/head-n-ui-core.css'))) {
				throw 'Missing head-n-ui-core.css file';
			}
		})
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
