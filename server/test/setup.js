const sinon = require('sinon');
const logger = require('@financial-times/n-logger').default;

let loggerSandbox;

beforeEach(() => {
	loggerSandbox = sinon.sandbox.create();
	[ 'info', 'warn', 'error' ].map(logLevel => {
		loggerSandbox.stub(logger, logLevel).callsFake(console[logLevel]); // eslint-disable-line
	});
});

afterEach(() => {
	loggerSandbox.restore();
});
