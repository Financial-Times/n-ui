const program = require('commander');
const logger = require('./logger');
const fs = require('fs');
const path = require('path');
const shellpromise = require('shellpromise');
const shellpipe = require('./shellpipe');
const grabNUiAssets = require('./grab-n-ui-assets');
const assetHashes = require('../lib/generate-asset-hashes');
const fetchres = require('fetchres');
const circleFetch = require('./circle-fetch');
const fetch = require('node-fetch');

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

const getAppVersion = () => {
	if(process.env.HEROKU_SLUG_COMMIT) {
		// For apps that use the heroku-postbuild to build, there is no git repository
		// so we need to enable Dyno Metadata and get the commit hash from environment variable
		return Promise.resolve(process.env.HEROKU_SLUG_COMMIT);
	} else {
		return shellpromise('git rev-parse HEAD | xargs echo -n');
	}
};

const aboutJson = () => {
	appPackageJson = require(path.join(process.cwd(), '/package.json'));

	return getAppVersion().then(version => {
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

const getCssEntryPoints = () => {
	const buildConfig = require(path.join(process.cwd(), 'n-ui-build.config.js'));
	return Object.keys(buildConfig.entry)
		.map(target => [target, buildConfig.entry[target]])
		.filter(([target]) => target.includes('.css'));
};

program.version(nUiVersion);

const webpackConfPath = path.join(__dirname, 'webpack.config.js');

const DEFAULT_REGISTRY_URI = 'https://next-registry.ft.com/v2/services.json';

const triggerMasterBuild = (project) => circleFetch(`/${project}/build`, { method: 'POST', body: JSON.stringify({ branch: 'master' }) });

const lastMasterBuild = (project) => circleFetch(`/${project}/tree/master`);

const getRepoName = ({ repository }) => {
	if (/https?:\/\/github\.com\/Financial-Times\//.test(repository)) {
		return repository
			.replace(/https?:\/\/github\.com\/Financial-Times\//, '')
			.replace(/\/$/, ''); // trim trailing "/"
	}
};

const serves = type => app => type ? app.types && app.types.includes(type) : true;

const getAllAppsToRebuild = async (allApps, registry, servesType) => {

	const registryData = await fetch(registry).then(fetchres.json);
	return registryData
		.filter(serves(servesType))
		.map(getRepoName)
		.filter(Boolean);
};

async function rebuild (options) {
	const { apps, allApps, servesType, registry = DEFAULT_REGISTRY_URI } = options;
	let appsToRebuild = [];

	const areAppsToRebuild = apps.length || allApps;
	if (!areAppsToRebuild) {
		console.log('Use the --all flag to rebuild all apps or supply a specific app name.'); // eslint-disable-line no-console
		process.exit(1);
	}

	if (apps.length) {
		appsToRebuild = apps;
	} else if (allApps) {
		appsToRebuild = await getAllAppsToRebuild(allApps, registry, servesType);
	}

	return Promise.all(appsToRebuild.map(async app => {
		console.log(`Considering whether to rebuild ${app}`); // eslint-disable-line no-console
		try {
			const [lastBuild] = await lastMasterBuild(app);
			console.log(`Triggering master build for ${app} (git commit: ${lastBuild.vcs_revision})`); // eslint-disable-line no-console
			await triggerMasterBuild(app);
		} catch (error) {
			console.log(`Skipped rebuild of ${app}, probably because Circle CI not set up for this repo`); // eslint-disable-line no-console
		}
	}));
};

program
	.command('build')
	.description('Builds n-ui apps, ready to be deployed to your favourite s3 bucket or heroku host')
	.option('--production', 'Builds with production settings')
	.option('--sass-only', 'Builds Sass only')
	.option('--js-only', 'Builds JavaScript only')
	.action(options => {

		devAdvice();
		let concurrentCommands = [];

		const cssEntryPoints = getCssEntryPoints();
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
				if (options.production && fs.existsSync(path.join(process.cwd(), 'Procfile')) && !fs.existsSync(path.join(process.cwd(), 'app.json'))) {
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
		const cssEntryPoints = getCssEntryPoints();

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
	.command('rebuild [apps...]')
	.description('Trigger a rebuild of the latest master on Circle')
	.option('--all', 'Trigger rebuilds of all apps.')
	.option('--registry [registry-uri]', `use this registry, instead of the default: ${DEFAULT_REGISTRY_URI}`, DEFAULT_REGISTRY_URI)
	.option('--serves <type>', 'Trigger rebuilds of apps where type is served.')
	.action((apps, opts) => {
		devAdvice();
		return rebuild({
			apps: apps,
			servesType: opts.serves,
			registry: opts.registry,
			allApps: opts.all
		}).catch(exit);
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
