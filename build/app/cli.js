const program = require('commander');
const logger = require('./logger');
const fs = require('fs');
const path = require('path');
const shellpromise = require('shellpromise');
const shellpipe = require('./shellpipe');
const downloadAssets = require('./download-assets');
const assetHashes = require('../lib/generate-asset-hashes');
const sendBuildMetrics = require('../lib/send-build-metrics');

const exit = err => {
	logger.error(err);
	if (err.stack) {
		logger.error(err.stack);
	}
	process.exit(1);
};

const devAdvice = () => {
	if (!process.env.CIRCLE_BRANCH && (!process.env.NEXT_APP_SHELL || process.env.NEXT_APP_SHELL !== 'local')) {
		logger.info('Developers: If you want your app to point to n-ui locally, then `export NEXT_APP_SHELL=local`');
	}
};
const nUiVersion = require('../../package.json').version;

let appPackageJson;
const aboutJson = () => {
	appPackageJson = require(path.join(process.cwd(), '/package.json'));

	return shellpromise('git rev-parse HEAD | xargs echo -n')
		.then(version => {
			return {
				description: appPackageJson.name,
				support: 'next.team@ft.com',
				supportStatus: 'active',
				appVersion: version,
				buildCompletionTime: new Date().toISOString(),
				nUiVersion
			};
		})
		.then(about => fs.writeFileSync(path.join(process.cwd(), '/public/__about.json'), JSON.stringify(about, null, 2)));
};


program.version(nUiVersion);

const webpackConfPath = path.join(__dirname, 'webpack.js');

program
	.command('build')
	.description('Builds n-ui apps, ready to be deployed to your favourite s3 bucket or heroku host')
	.option('--production', 'Builds with production settings')
	.action(options => {

		devAdvice();
		const buildStartTime = Date.now();

		shellpipe(`webpack --bail --config ${webpackConfPath} ${options.production ? '-p' : ''}`)
			.then(() => options.production && assetHashes())
			.then(aboutJson)
			.then(downloadAssets)
			.then(() => {

				const buildTime = Date.now() - buildStartTime;

				// Don't send metrics from CircleCI builds
				if (!process.env.CIRCLECI) {
					sendBuildMetrics(appPackageJson.name, buildTime);
				}

				if (options.production && fs.existsSync(path.join(process.cwd(), 'Procfile'))) {
					return shellpipe('haikro build');
				}
			})
			.catch(exit);
	});

program
	.command('watch')
	.description('Builds and watches front end of n-ui apps')
	.action(() => {

		devAdvice();

		downloadAssets()
			.then(() => shellpipe(`webpack --watch --config ${webpackConfPath}`))
			.catch(exit);
	});

program
	.command('*')
	.description('')
	.action(function (app) {
		exit('The command ‘' + app + '’ is not known');
	});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
	program.outputHelp();
}
