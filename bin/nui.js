#!/usr/bin/env node

const spawn = require('child_process').spawn;
const program = require('commander');
const colors = require('colors');
const util = require('util');
const fs = require('fs');
const path = require('path');

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

program.version(require('../package.json').version);

program
	.command('build')
	.description('Builds n-ui apps, ready to be deployed t oyour favourite s3 bucket or heroku host')
	.option('--production', 'Builds with production settings')
	.action(function (options) {

// # Remind developers that if they want to use a local version of n-ui,
// # they need to `export NEXT_APP_SHELL=local`
// dev-n-ui:
// ifeq ($(NODE_ENV),) # Not production
// ifeq ($(CIRCLE_BRANCH),) # Not CircleCI
// ifneq ($(shell grep -s -Fim 1 n-ui bower.json),) # The app is using n-ui
// ifneq ($(NEXT_APP_SHELL),local) # NEXT_APP_SHELL is not set to local
// 	$(info Developers: If you want your app to point to n-ui locally, then `export NEXT_APP_SHELL=local`)
// endif
// endif
// endif
// endif
//
// make public/__about.json ... but need to apply to non Procfiles? else next-errors??

		shell(`webpack ${options.production ? '--bail' : '--dev'}`)
			.then(() => {
				//add to about json
				//download n-ui files from network - force it, but fail gracefully if
				//in dev and offline and files exist
				//alert that appp-shell=local is a workaround for poor network
			})
			.then(() => {
				if (options.production && fs.existsSync(path.join(process.cwd(), 'Procfile'))) {
					return shell('haikro build');
				}
			})
			.catch(utils.exit)
	});




program
	.command('watch')
	.description('Builds n-ui apps, ready to be deployed t oyour favourite s3 bucket or heroku host')
	.action(function (options) {

// # Remind developers that if they want to use a local version of n-ui,
// # they need to `export NEXT_APP_SHELL=local`
// dev-n-ui:
// ifeq ($(NODE_ENV),) # Not production
// ifeq ($(CIRCLE_BRANCH),) # Not CircleCI
// ifneq ($(shell grep -s -Fim 1 n-ui bower.json),) # The app is using n-ui
// ifneq ($(NEXT_APP_SHELL),local) # NEXT_APP_SHELL is not set to local
// 	$(info Developers: If you want your app to point to n-ui locally, then `export NEXT_APP_SHELL=local`)
// endif
// endif
// endif
// endif
//
// make public/__about.json ... but need to apply to non Procfiles? else next-errors??
//download n-ui files from network if not already present
//.then
		shell(`webpack --watch ${options.production ? '--bail' : '--dev'}`)
			.then(() => {

				//how to force fetching them after reinstall of n-ui
			})
			.then(() => {
				if (options.production && fs.existsSync(path.join(process.cwd(), 'Procfile'))) {
					return shell('haikro build');
				}
			})
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
