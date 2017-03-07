const express = require('../../..');
const app = module.exports = express({
	name: 'bad-assets',
	systemCode: 'bad-assets',
	withLayoutPolling: false,
	directory: __dirname
});

module.exports.listen = app.listen(3000);
