'use strict';
const fs = require('fs');
const express = require('../server');
const path = require('path');
const deployStatic = require('@financial-times/n-heroku-tools').deployStatic.task;
const chalk = require('chalk');
const errorHighlight = chalk.bold.red;
const highlight = chalk.bold.green;

const app = module.exports = express({
	name: process.env.CIRCLE_BUILD_NUM ? `n-ui/test-page/${process.env.CIRCLE_BUILD_NUM}/public` : 'public',
	systemCode: 'n-ui-test',
	withFlags: true,
	withHandlebars: true,
	withNavigation: true,
	withAnonMiddleware: true,
	withLayoutPolling: false,
	layoutsDir: path.join(process.cwd(), '/browser/layout'),
	viewsDirectory: '/demo/views',
	partialsDirectory: [
		process.cwd() + '/browser',
		process.cwd() + '/components'
	],
	directory: process.cwd()
});

app.locals.nUiConfig = {
	preset: 'complete',
	features: {
		feedback: true
	}
};

app.use(require('./middleware/assets'));

app.get(/^\/(test-page.html)?$/, (req, res) => {
	res.render('default', {
		isFrontPage: true,
		title: 'Test App',
		layout: 'wrapper'
	});
});

app.get('/components/n-ui/:component', (req, res) => {
	const component = req.params.component;
	let config;
	try {
		config = require(`../components/n-ui/${component}/pa11y-config`);
	} catch (e) {
		// if no config it's probably a request for a sourcemap from an inlined stylesheet, which just causes a load of
		// confusing errors
		return res.sendStatus(404);
	}
	const handlebarsDataClone = JSON.parse(JSON.stringify(config.handlebarsData));
	const model = Object.assign({
		title: 'Test App',
		layout: '../layout/vanilla'
	}, handlebarsDataClone);

	res.render(`../../components/n-ui/${component}/${config.handlebarsData.template}`, model);
});

app.get('*', (req, res) => {
	fetch('https://www.ft.com' + req.originalUrl, {
		headers: req._headers,
		method: req.method
	})
		.then(response => {
			response.body.pipe(res);
		});
});

app.listen(5005)
	.then(app => {
		if (process.env.PA11Y) {
			const spawn = require('child_process').spawn;
			const pa11y = spawn('pa11y-ci');

			pa11y.stdout.on('data', (data) => {
				console.log(highlight(`${data}`)); //eslint-disable-line
			});

			pa11y.stderr.on('data', (error) => {
				console.log(errorHighlight(`${error}`)); //eslint-disable-line
			});

			pa11y.on('close', (code) => {
				process.exit(code);
			});
		}
		// In CircleCI: Deploy a test static site to s3 (Amazon AWS) for testing.
		else if (process.env.CIRCLE_BUILD_NUM) {
			fetch('http://localhost:5005/', {
				headers: {
					'FT-Flags': 'ads:off'
				}
			})
				.then(res => res.text())
				// hack to make sure the demo page deployed to s3 for browser testing
				// includes the css and js properly (unlike the real local app we can't
				// map /public to any path we like on s3)
				.then(text => text.replace(/__dev\/assets\//g, ''))
				.then(text => fs.writeFileSync(path.join(process.cwd(), 'test-page.html'), text))
				.then(() => app.close())
				.then(() => {
					return deployStatic({
						files: [
							'test-page.html',
							'public/main.css',
							'public/main.js',
							'public/main.js.map',
							'public/n-ui/appshell.js',
							'public/n-ui/appshell.js.map',
							'public/n-ui/font-loader.js',
							'public/n-ui/font-loader.js.map',
							'public/n-ui/o-errors.js',
							'public/n-ui/o-errors.js.map'
						],
						destination: `n-ui/test-page/${process.env.CIRCLE_BUILD_NUM}/`,
						bucket: 'ft-next-test-artefacts',
						cacheControl: 'no-cache, must-revalidate',
					})
						.catch(err => {
							console.error(err) //eslint-disable-line
							process.exit(2);
						});
				})
				.then(() => {
					console.log('deployed test static site to s3'); //eslint-disable-line
					process.exit(0);
				})
				.catch(err => {
					console.error(err) //eslint-disable-line
					process.exit(2);
				});
		}
		else {
			const developerFeedback = '*\r\n* Developers note: _test-server/app only does anything if there\'s a `process.env.PA11Y` or a `process.env.CIRCLE_BUILD_NUM` environment variable. Basically, it\'s only meant to run in CircleCI. \r\n*';
			console.error(developerFeedback) //eslint-disable-line
		}
	});
