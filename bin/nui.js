#!/usr/bin/env node

const spawn = require('child_process').spawn;
const program = require('commander');
const colors = require('colors');
const util = require('util');

function shell (processToRun, options) {
	options = options || {};
	if (options.verbose) {
		console.log("shellpromise: about to spawn " + processToRun);
	}
	return new Promise(function(resolve, reject) {
		var spawnOpts = {
			env: options.env || process.env,
			cwd: options.cwd || process.cwd(),
		};

		if (options.verbose) {
			spawnOpts.stdio = 'inherit';
		}
		var local = spawn('sh', ['-c', processToRun], {
			env: options.env || process.env,
			cwd: options.cwd || process.cwd(),
			stdio: 'inherit'
		});

		local.on('error', reject);
		local.on('close', function(code) {
			if (code === 0) {
				resolve(output);
			} else {
				if (options.verbose) {
					console.warn(processToRun + ' exited with exit code ' + code);
				}
				reject(new Error(output));
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
	.action(function () {
		shell('webpack')
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
