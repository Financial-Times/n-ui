const Graphite = require('next-metrics/lib/graphite/client');

module.exports = (appName, buildTime) => {
	const graphite = new Graphite({
		destinations: [{
			host: 'graphite.ft.com',
			port: 2003,
			key: process.env.FT_GRAPHITE_KEY
		}],
		prefix: `.localhost.${appName}._.`,
		noLog: false
	});

	graphite.log({
		'build.time': buildTime,
		'build.count': 1,
	});
};
