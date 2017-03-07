const spawn = require('child_process').spawn;
const logger = require('./logger');

module.exports = function shellpipe (processToRun, options) {
	options = options || {};
	if (options.verbose) {
		logger.info('shellpromise: about to spawn ' + processToRun);
	}
	return new Promise((resolve, reject) => {
		const local = spawn('sh', ['-c', processToRun], {
			env: options.env || process.env,
			cwd: options.cwd || process.cwd(),
			stdio: 'inherit'
		});

		local.on('error', reject);
		local.on('close', (code) => {
			if (code === 0) {
				resolve(processToRun + ' complete');
			} else {
				reject(processToRun + ' exited with exit code ' + code);
			}
		});
	});
};
