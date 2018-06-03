const sinon = require('sinon');
const { default: logger } = require('@financial-times/n-logger');
process.on('uncaughtException', function (err) {
	console.log('MUURRR', err); //eslint-disable-line
});
let loggerSandbox;

beforeEach(() => {
	loggerSandbox = sinon.createSandbox();
	[ 'info', 'warn', 'error' ].map(logLevel => {
		loggerSandbox.stub(logger, logLevel).callsFake(console[logLevel]); // eslint-disable-line
	});
});

afterEach(() => {
	loggerSandbox.restore();
});
