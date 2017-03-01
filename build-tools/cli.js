const spawn = require('child_process').spawn;
const program = require('commander');
const colors = require('colors');
const util = require('util');
const fs = require('fs');
const path = require('path');
const ratRace = require('promise-rat-race');
const nEagerFetch = require('n-eager-fetch');
const shellpromise = require('shellpromise');
const nUiManager = require('../node/lib/n-ui-manager')
const nUiWebpack = require('./webpack');

function shell (processToRun, options) {
	options = options || {};
	if (options.verbose) {
		console.log("shellpromise: about to spawn " + processToRun);
	}
	return new Promise(function(resolve, reject) {
		var local = spawn('sh', ['-c', processToRun], {
			env: options.env || process.env,
			cwd: options.cwd || process.cwd(),
			stdio: 'inherit'
		});

		local.on('error', reject);
		local.on('close', function(code) {
 			if (code === 0) {
 				resolve(processToRun + ' complete');
  		} else {
 				reject(processToRun + ' exited with exit code ' + code);
 			}
		});
	});
};


function log(args, color){
	let msg = util.format.apply(null, args);
	if(color){
		msg = colors[color](msg);
	}
	console.log(msg);
}

const logger = {
	info: function () {
		log([].slice.apply(arguments), 'cyan');
	},
	warn: function () {
		log([].slice.apply(arguments), 'yellow');
	},
	error: function () {
		log([].slice.apply(arguments), 'red');
	},
	log: function () {
		log([].slice.apply(arguments));
	},
	success: function () {
		log([].slice.apply(arguments), 'green');
	}
};


const utils = {
	list: val => {
		return val.split(',');
	},

	exit: err => {
		logger.error(err);
		if (err.stack) {
			logger.error(err.stack);
		}
		process.exit(1);
	}
};

const aboutJson = () => {
	return shellpromise('git rev-parse HEAD | xargs echo -n')
		.then(version => {
			return {
				description: require(path.join(process.cwd(), '/package.json')).name,
				support: 'next.team@ft.com',
				supportStatus: 'active',
				appVersion: version,
				buildCompletionTime: new Date().toISOString(),
				nUiVersion: require('../package.json').version
			}
		})
		.then(about => fs.writeFileSync(path.join(process.cwd(), '/public/__about.json'), JSON.stringify(about, null, 2)))
}

const devAdvice = () => {
	if (!process.env.CIRCLE_BRANCH) {
		logger.info('Developers: If you want your app to point to n-ui locally, then `export NEXT_APP_SHELL=local`')
	}
}




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
const downloadAssets = () => {

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

program.version(require('../package.json').version);

program
	.command('build')
	.description('Builds n-ui apps, ready to be deployed to your favourite s3 bucket or heroku host')
	.option('--production', 'Builds with production settings')
	.action(options => {

		devAdvice();

		shell(`webpack ${options.production ? '--bail' : '--dev'} --config ${path.join(__dirname, '../build-tools/webpack.js')}`)
			.then(aboutJson)
			.then(downloadAssets)
			.then(() => {
				if (options.production && fs.existsSync(path.join(process.cwd(), 'Procfile'))) {
					return shell('haikro build');
				}
			})
			.catch(utils.exit)
	});

program
	.command('watch')
	.description('Builds and watches front end of n-ui apps')
	.action(() => {

		devAdvice();

		downloadAssets()
			.then(() => shell(`webpack --watch --dev --config ${path.join(__dirname, '../build-tools/webpack.js')}`)	)
			.catch(utils.exit)
	});

program
	.command('*')
	.description('')
	.action(function (app) {
		utils.exit("The command ‘" + app + "’ is not known");
	});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
	program.outputHelp();
}
