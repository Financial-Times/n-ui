const express = require('../../..');
const app = module.exports = express({
	name: 'layout-polling',
	withLayoutPolling: true,
	withNavigation: false,
	withNavigationHierarchy: false,
	withAnonMiddleware: false,
	withJsonLd: false,
	withBackendAuthentication: false,
	withServiceMetrics: true,
	directory: __dirname,
	layoutsDir: __dirname + '/views/'
});

app.get('/', function (req, res) {
	res.render('main', {
		layout: 'wrapper'
	});
});

module.exports.listen = app.listen(3000);
