const program = require('commander');
const logger = require('./logger');
const fs = require('fs');
const path = require('path');
const shellpromise = require('shellpromise');
const shellpipe = require('./shellpipe');
const grabNUiAssets = require('./grab-n-ui-assets');
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

const buildConfig = require(path.join(process.cwd(), 'n-ui-build.config.js'));
const cssEntryPoints = Object.keys(buildConfig.entry)
	.map(target => [target, buildConfig.entry[target]])
	.filter(([target]) => target.includes('.css'));

program.version(nUiVersion);

const webpackConfPath = path.join(__dirname, 'webpack.config.js');

program
	.command('build')
	.description('Builds n-ui apps, ready to be deployed to your favourite s3 bucket or heroku host')
	.option('--production', 'Builds with production settings')
	.option('--sass-only', 'Builds Sass only')
	.option('--js-only', 'Builds JavaScript only')
	.action(options => {

		devAdvice();
		const buildStartTime = Date.now();
		let concurrentCommands = [];

		const script = './node_modules/@financial-times/n-ui/scripts/build-sass.sh';
		const commands = {
			jsOnly: `'webpack ${options.production ? '--mode=production' : ''} --config ${webpackConfPath}'`,
			sassOnly: `${cssEntryPoints
				.map(([target, entry]) => `'export CSS_SOURCE_MAPS=${!options.production} && ${script} ${entry} ${target}'`)
				.join(' ')}`
		};

		for(let key in commands) {
			if(!!options[key]) {
				concurrentCommands.push(commands[key]);
			}
		}

		concurrentCommands = concurrentCommands.length
			? concurrentCommands
			: Object.keys(commands).map(c => commands[c]);

		shellpipe(`concurrently ${concurrentCommands.join(' ')}`)
			.then(() => options.production && assetHashes())
			.then(aboutJson)
			.then(grabNUiAssets)
			.then(() => {

				const buildTime = Date.now() - buildStartTime;

				// Don't send metrics from CircleCI builds
				if (!process.env.CIRCLECI && !options['js-only'] && !options['sass-only']) {
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
		const cssBuildWatchCommands = cssEntryPoints.map(([target, entry]) => {
			const script = './node_modules/@financial-times/n-ui/scripts/build-sass.sh';
			const entryDirectory = path.dirname(entry);
			const command = `${script} ${entry} ${target}`;
			return `"watch-run -ip '${entryDirectory}/**/*.scss' ${command}"`;
		}).join(' ');

		grabNUiAssets()
			.then(() => shellpipe(`concurrently "webpack --watch --config ${webpackConfPath}" ${cssBuildWatchCommands}`))
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
